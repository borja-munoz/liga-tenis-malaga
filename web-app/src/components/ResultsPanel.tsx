import { useEffect, useState } from "react";

import { Accordion, AccordionDetails, AccordionSummary, Grid2 as Grid } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { usePlayerResultsCycles, usePlayerResultsPlayoffs } from "../models/model";
import { FormattedMessage } from "react-intl";
import MatchResult from "./MatchResult";

export type ResultInfo = {
  season: number;
  cycle: number;
  group: number | string;
  round: string;
  roundOrder: number;
  opponent: string;
  playerSeed: number;
  opponentSeed: number;
  club: string;
  matchWon: boolean;
  gamesWonSetOne: number;
  gamesLostSetOne: number;
  gamesWonSetTwo: number;
  gamesLostSetTwo: number;
  gamesWonSetThree: number;
  gamesLostSetThree: number;
  superTieBreakWinner: string;
  playerRetired: boolean;
  opponentRetired: boolean;
};

export default function ResultPanel({ playerName }: { playerName: string }) {
  const [resultsData, setResultsData] = useState<ResultInfo[][] | null>(null);
  const { data: resultsCyclesResult, status: resultsCyclesStatus } = usePlayerResultsCycles(playerName);
  const { data: resultsPlayoffsResult, status: resultsPlayoffsStatus } = usePlayerResultsPlayoffs(playerName);

  useEffect(() => {
    setResultsData(null);
  }, [playerName]);

  if (resultsCyclesStatus == "success" && 
      resultsPlayoffsStatus == "success" && 
      resultsData === null) {
    let results = resultsCyclesResult?.toArray();
    results.push(...(resultsPlayoffsResult?.toArray()));
    results.sort((a, b) => {
      if (a.season_id < b.season_id) {
        return -1;
      }
      else if (a.season_id > b.season_id) {
        return 1;
      }
      else {
        // a.season = b.season
        if (a.cycle_order) {
          if (a.cycle_order < b.cycle_order) {
            return -1;
          }
          else if (a.cycle_order > b.cycle_order) {
            return 1;
          }
          else {
            return 0;
          }
        }
        else {
          // Playoffs
          if (a.group_name < b.group_name) {
            return -1;
          }
          else if (a.group_name > b.group_name) {
            return 1;
          }
          else {
            return a.round_order - b.round_order;
          }
        }
      }  
    });
    // Prepare results for accordion (one array element per season)
    if (results.length > 0) {
      let currentSeason = results[0].season_id;
      let matches: ResultInfo[][] = [];
      let seasonMatches: ResultInfo[] = [];
      results.forEach((match) => {
        let matchWon = false;
        let season = match.season_id;
        let cycle = match.cycle_order;
        let group = match.group_number ? match.group_number : match.group_name;
        let round = match.round;
        let roundOrder = match.round_order;
        let opponent: string;
        let playerSeed: number;
        let opponentSeed: number;
        let club = match.club;
        let gamesWonSetOne: number;
        let gamesLostSetOne: number;
        let gamesWonSetTwo: number;
        let gamesLostSetTwo: number;
        let gamesWonSetThree: number;
        let gamesLostSetThree: number;
        let superTieBreakWinner = '';
        let playerRetired = false;
        let opponentRetired = false;

        // Opponent and games won
        if (match.player_a == playerName) {
          opponent = match.player_b;
          playerSeed = match.player_a_seed;
          opponentSeed = match.player_b_seed;          
          gamesWonSetOne = match.games_won_player_a_set_one;
          gamesLostSetOne = match.games_won_player_b_set_one;
          gamesWonSetTwo = match.games_won_player_a_set_two;
          gamesLostSetTwo = match.games_won_player_b_set_two;
          gamesWonSetThree = match.games_won_player_a_set_three;
          gamesLostSetThree = match.games_won_player_b_set_three;
        }
        else {
          opponent = match.player_a;
          playerSeed = match.player_b_seed;
          opponentSeed = match.player_a_seed;          
          gamesWonSetOne = match.games_won_player_b_set_one;
          gamesLostSetOne = match.games_won_player_a_set_one;
          gamesWonSetTwo = match.games_won_player_b_set_two;
          gamesLostSetTwo = match.games_won_player_a_set_two;
          gamesWonSetThree = match.games_won_player_b_set_three;
          gamesLostSetThree = match.games_won_player_a_set_three;
        }

        // Retired player
        if (match.retired_player) {
          if (match.retired_player != playerName) {
            matchWon = true;
            opponentRetired = true;
          }
          else {
            playerRetired = true;
          }
        }

        // Super tie break
        if (match.super_tie_break_winner) {
          if (match.super_tie_break_winner == playerName) {
            matchWon = true;
            superTieBreakWinner = playerName;
          }
          else {
            superTieBreakWinner = opponent;
          }
        }

        // Sets won
        let setsWon = 0;
        if (gamesWonSetOne > gamesLostSetOne) {
          setsWon += 1;
        }
        if (gamesWonSetTwo > gamesLostSetTwo) {
          setsWon += 1;
        }
        if (gamesWonSetThree) {
          if (gamesWonSetThree > gamesLostSetThree) {
            setsWon += 1;
            matchWon = true;
          }  
        }
        else {
          if (setsWon == 2 && !playerRetired) {
            matchWon = true;
          }  
        }

        let matchResult = {
          season,
          cycle,
          group,
          round,
          roundOrder,
          opponent,
          playerSeed,
          opponentSeed,
          club,
          matchWon,
          gamesWonSetOne,
          gamesLostSetOne,
          gamesWonSetTwo,
          gamesLostSetTwo,
          gamesWonSetThree,
          gamesLostSetThree,
          superTieBreakWinner,
          playerRetired,
          opponentRetired,
        };
        if (season == currentSeason) {
          seasonMatches.push(matchResult);
        }
        else {
          matches.push(seasonMatches);
          currentSeason = season;
          seasonMatches = [matchResult];
        }
      });
      matches.push(seasonMatches);
      setResultsData(matches);
    }
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={1}>
      {resultsData && (
        <Grid container size={12} direction="column">
          <Grid size={12}>
            {resultsData.map((seasonResults, index) => 
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <FormattedMessage id="season" /> {seasonResults[0].season}
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container size={12} rowSpacing={5} columnSpacing={5}>
                    {seasonResults.map((result) => (
                      <Grid key={result.cycle + result.opponent} 
                            size={{ xs: 12, sm: 4, md: 3 }}
                            sx={{ 
                              padding: "10px", 
                              border: "1px #DDDDDD solid",
                              borderRadius: "5px",
                              boxShadow: "3px 3px #FAFAFA"
                            }}
                      >
                        <MatchResult 
                          key={result.opponent} 
                          playerName={playerName} 
                          result={result} 
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
       </Grid>
      )}
    </Grid>
 );
}
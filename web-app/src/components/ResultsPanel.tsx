import { useEffect, useState } from "react";

import { Accordion, AccordionDetails, AccordionSummary, Grid2 as Grid } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { usePlayerResults } from "../models/model";
import { FormattedMessage } from "react-intl";
import MatchResult from "./MatchResult";

export type ResultInfo = {
  season: number;
  cycle: number;
  group: number;
  opponent: string;
  club: string;
  matchWon: boolean;
  gamesWonSetOne: number;
  gamesLostSetOne: number;
  gamesWonSetTwo: number;
  gamesLostSetTwo: number;
  superTieBreakWinner: string;
  playerRetired: boolean;
  opponentRetired: boolean;
};

export default function ResultPanel({ playerName }: { playerName: string }) {
  const [resultsData, setResultsData] = useState<ResultInfo[][] | null>(null);
  const { data: resultsResult, status: resultsStatus } = usePlayerResults(playerName);

  useEffect(() => {
    setResultsData(null);
  }, [playerName]);

  if (resultsStatus == "success" && resultsData === null) {
    const results = resultsResult?.toArray();
    // Prepare results for accordion (one array element per season)
    if (results.length > 0) {
      let currentSeason = results[0].season_id;
      let matches: ResultInfo[][] = [];
      let seasonMatches: ResultInfo[] = [];
      results.forEach((match) => {
        let matchWon = false;
        let season = match.season_id;
        let cycle = match.cycle_order;
        let group = match.group_number;
        let opponent: string;
        let club = match.club;
        let gamesWonSetOne: number;
        let gamesLostSetOne: number;
        let gamesWonSetTwo: number;
        let gamesLostSetTwo: number;
        let superTieBreakWinner = '';
        let playerRetired = false;
        let opponentRetired = false;

        // Opponent and games won
        if (match.player_a == playerName) {
          opponent = match.player_b;
          gamesWonSetOne = match.games_won_player_a_set_one;
          gamesLostSetOne = match.games_won_player_b_set_one;
          gamesWonSetTwo = match.games_won_player_a_set_two;
          gamesLostSetTwo = match.games_won_player_b_set_two;
        }
        else {
          opponent = match.player_a;
          gamesWonSetOne = match.games_won_player_b_set_one;
          gamesLostSetOne = match.games_won_player_a_set_one;
          gamesWonSetTwo = match.games_won_player_b_set_two;
          gamesLostSetTwo = match.games_won_player_a_set_two;
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
        if (setsWon == 2 && !playerRetired) {
          matchWon = true;
        }

        let matchResult = {
          season,
          cycle,
          group,
          opponent,
          club,
          matchWon,
          gamesWonSetOne,
          gamesLostSetOne,
          gamesWonSetTwo,
          gamesLostSetTwo,
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
                  <Grid container size={12} rowSpacing={6} columnSpacing={10}>
                    {seasonResults.map((result) => (
                      <Grid key={result.cycle + result.opponent} size={{ xs: 12, sm: 4, md: 3 }}>
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
import { useEffect, useState } from "react";

import { Grid2 as Grid, Typography, styled } from "@mui/material";

import { usePlayerResults } from "../models/model";
import { FormattedMessage } from "react-intl";

type PlayerSummary = {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  superTieBreaksWon: number;
  superTieBreaksLost: number;
  matchesRetired: number;
};

const GridTitle = styled(Grid)(() => ({
  lineHeight: 0.2,
  minWidth: '55px',
}));

const TitleTypography = styled(Typography)(() => ({
  color: "#555555",
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export default function PlayerSummaryPanel({ playerName }: { playerName: string }) {
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null);
  const { data: playerSummaryResult, status: playerSummaryStatus } = usePlayerResults(playerName);

  useEffect(() => {
    setPlayerSummary(null);
  }, [playerName]);

  if (playerSummaryStatus == "success" && playerSummary === null) {
    const matches = playerSummaryResult?.toArray();
    const matchesPlayed = matches.length;
    let matchesWon = 0;
    let matchesLost = 0;
    let setsWon = 0;
    let setsLost = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let superTieBreaksWon = 0;
    let superTieBreaksLost = 0;
    let matchesRetired = 0;
    matches.forEach((match) => {
      let matchWon = false;
      // Retired player
      if (match.retired_player) {
        if (match.retired_player != playerName) {
          matchWon = true;
        }
        else {
          matchesRetired += 1;
        }
      }
      // Super tie break
      if (match.super_tie_break_winner) {
        if (match.super_tie_break_winner == playerName) {
          matchWon = true;
          superTieBreaksWon += 1;
        }
        else {
          superTieBreaksLost += 1;
        }
      }
      // Sets
      let setsWonPlayerA = 0;
      let setsWonPlayerB = 0;
      // First set
      if (match.games_won_player_a_set_one >
          match.games_won_player_b_set_one) {
        setsWonPlayerA += 1;
      }
      else {
        setsWonPlayerB += 1;
      }
      // Second set 
      if (match.games_won_player_a_set_two >
          match.games_won_player_b_set_two) {
        setsWonPlayerA += 1;
      }        
      else {
        setsWonPlayerB += 1;
      }
      // Games
      let gamesWonPlayerA = match.games_won_player_a_set_one +
                            match.games_won_player_a_set_two;
      let gamesWonPlayerB = match.games_won_player_b_set_one + 
                            match.games_won_player_b_set_two;
      if (match.player_a == playerName) {
        setsWon += setsWonPlayerA;
        setsLost += setsWonPlayerB;
        if (setsWonPlayerA == 2) {
          matchWon = true;
        }
        gamesWon += gamesWonPlayerA;
        gamesLost += gamesWonPlayerB;
      }
      else {
        setsWon += setsWonPlayerB;
        setsLost += setsWonPlayerA;
        if (setsWonPlayerB == 2) {
          matchWon = true;
        }
        gamesWon += gamesWonPlayerB;
        gamesLost += gamesWonPlayerA;
      }
      if (matchWon) {
        matchesWon += 1;
      }
      else {
        matchesLost += 1;
      }
    });
    setPlayerSummary({
      matchesPlayed,
      matchesWon,
      matchesLost,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
      superTieBreaksWon,
      superTieBreaksLost,
      matchesRetired,
    })
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={1}>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="matchesPlayed" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.matchesPlayed}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="matchesWon" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.matchesWon}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="matchesLost" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.matchesLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="setsWon" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.setsWon}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="setsLost" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.setsLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="setsBalance" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary && playerSummary.setsWon - playerSummary.setsLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="gamesWon" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.gamesWon}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="gamesLost" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.gamesLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="gamesBalance" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary && playerSummary.gamesWon - playerSummary.gamesLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="superTieBreaksWon" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.superTieBreaksWon}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          <TitleTypography variant="caption"><FormattedMessage id="superTieBreaksLost" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.superTieBreaksLost}</ValueTypography>
        </Grid>
      </Grid>
      <Grid container size={4} direction="column" rowSpacing={1}>
        <GridTitle size={6}>
          {/* @ts-ignore */}
          <TitleTypography component="div" sx={{ height: '59px', alignContent: 'center' }} variant="caption"><FormattedMessage id="matchesRetired" /></TitleTypography>
        </GridTitle>
        <Grid size={6}>
          <ValueTypography variant="body1">{playerSummary?.matchesRetired}</ValueTypography>
        </Grid>
      </Grid>
    </Grid>
 );
}
import { Grid2 as Grid, styled, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import { ResultInfo } from "./ResultsPanel";

const GridTitle = styled(Grid)(() => ({
  // lineHeight: 0.2,
  // minWidth: '55px',
  // minHeight: '40px',
  alignContent: 'center',
}));

const TitleTypography = styled(Typography)(() => ({
  color: '#555555',
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export default function MatchResult({ playerName, result }:{ playerName: string, result: ResultInfo }) {
  const intl = useIntl();

  // Bold font weight for winner
  let fontWeightPlayer = 'regular';
  let fontWeightOpponent = 'regular';
  if (result.matchWon) {
    fontWeightPlayer = 'bold';
  }
  else {
    fontWeightOpponent = 'bold';
  }

  // Bold font weight for set winner
  let fontWeightPlayerSetOne = 'regular';
  let fontWeightPlayerSetTwo = 'regular';
  let fontWeightOpponentSetOne = 'regular';
  let fontWeightOpponentSetTwo = 'regular';
  if (result.gamesWonSetOne > result.gamesLostSetOne) {
    fontWeightPlayerSetOne = 'bold';
  }
  else {
    fontWeightOpponentSetOne = 'bold';
  }
  if (result.gamesWonSetTwo > result.gamesLostSetTwo) {
    fontWeightPlayerSetTwo = 'bold';
  }
  else {
    fontWeightOpponentSetTwo = 'bold';
  }

  return (
    <Grid container rowSpacing={1} columnSpacing={1}>
      <Grid size={6}>
        <TitleTypography variant="caption">{intl.formatMessage({ id: "cycle" }) + " " + result.cycle}</TitleTypography>
      </Grid>
      <Grid size={6} sx={{ textAlign: 'end' }}>
        <TitleTypography variant="caption">{intl.formatMessage({ id: "group" }) + " " + result.group}</TitleTypography>
      </Grid>
      <GridTitle size={6}>
        <TitleTypography variant="body2" sx={{ fontWeight: fontWeightPlayer }}>
          {playerName + 
            (result.playerRetired ? ' (' + intl.formatMessage({ id: "retired" }) + ')' : '')
          }  
        </TitleTypography>
      </GridTitle>
      <GridTitle size={6} sx={{ textAlign: 'end' }}>
        <ValueTypography component="span" variant="body2" sx={{ fontWeight: fontWeightPlayerSetOne }}>{result.gamesWonSetOne}</ValueTypography>
        <ValueTypography component="span" variant="body2" sx={{ marginLeft: "10px", fontWeight: fontWeightPlayerSetTwo }}>{result.gamesWonSetTwo}</ValueTypography>
        {result.superTieBreakWinner != '' && (
          <ValueTypography component="span" variant="body2" sx={{ marginLeft: "10px", fontWeight: fontWeightPlayer }}>
            {result.superTieBreakWinner == playerName ? 1 : 0}
          </ValueTypography>
        )}
      </GridTitle>
      <GridTitle size={6}>
        <TitleTypography variant="body2" sx={{ fontWeight: fontWeightOpponent }}>
          {result.opponent + 
            (result.opponentRetired ? ' (' + intl.formatMessage({ id: "retired" }) + ')' : '')
          }  
        </TitleTypography>
      </GridTitle>
      <GridTitle size={6} sx={{ textAlign: 'end' }}>
        <ValueTypography component="span" variant="body2" sx={{ fontWeight: fontWeightOpponentSetOne }}>{result.gamesLostSetOne}</ValueTypography>
        <ValueTypography component="span" variant="body2" sx={{ marginLeft: "10px",  fontWeight: fontWeightOpponentSetTwo }}>{result.gamesLostSetTwo}</ValueTypography>
        {result.superTieBreakWinner != '' && (
          <ValueTypography component="span" variant="body2" sx={{ marginLeft: "10px", fontWeight: fontWeightOpponent }}>
            {result.superTieBreakWinner == playerName ? 0 : 1}
          </ValueTypography>
        )}
      </GridTitle>
      <Grid size={12}>
        <TitleTypography variant="caption">{result.club}</TitleTypography>
      </Grid>
    </Grid>
  );
}
import { useState } from "react";

import { Box, Grid2 as Grid, styled, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import { usePlayers } from "../models/model";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { FormattedMessage, useIntl } from "react-intl";
import PlayerSummaryPanel from "../components/PlayerSummaryPanel";
import CyclePanel from "../components/CyclePanel";
import ResultsPanel from "../components/ResultsPanel";

const CardTitleTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export default function Dashboard() {
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>();
  const { data: playerResult, status: statusPlayers } = usePlayers();
  const intl = useIntl();
  
  if (statusPlayers == "success" && playerData?.length == 0) {
    setPlayerData(playerResult?.toArray());
  }

  const playerList = playerData.map((player) => player.name);

  return (
    <Grid container>
      <Grid size={12}>
        <Box
          maxWidth="xs"
          sx={{
            display: "flex",
            flexDirection: "column",
            // alignItems: { xs: "center", md: "start" },
            padding: "20px",
          }}
        >
          <Grid container sx={{ flexDirection: { xs: "column", sm: "row"} }} spacing={3}>
            <Grid container size={{ xs: 12, sm:6, md: 4 }} >
                {/* <Grid size={12}>
                  <span>
                    <FormattedMessage id="players" />: {playerData.length}
                  </span>
                </Grid> */}
              {playerData && (
                <Grid size={12}>
                  <Autocomplete
                    value={selectedPlayer}
                    //@ts-ignore
                    onChange={(event: any, newValue: string | null) => {
                      setSelectedPlayer(newValue);
                    }}
                    disablePortal
                    options={playerList}
                    sx={{ minWidth: '225px', flexGrow: 1 }}
                    renderInput={(params) => (
                      <TextField {...params} 
                        label={intl.formatMessage({ id: "players" })} />
                    )}
                  />
                </Grid>
              )}
              {selectedPlayer && (
                <Grid container>
                  <Card sx={{ flexGrow: 1 }}>
                    <CardContent>
                      <CardTitleTypography gutterBottom variant="h5">
                        <FormattedMessage id="playerSummary" />
                      </CardTitleTypography>
                      <PlayerSummaryPanel playerName={selectedPlayer} />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            <Grid container size={{ xs: 12, sm: 6, md: 8 }} >
              {selectedPlayer && (
                <Card sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <CardTitleTypography gutterBottom variant="h5">
                      <FormattedMessage id="cycles" />
                    </CardTitleTypography>
                    <CyclePanel playerName={selectedPlayer} />
                  </CardContent>
                </Card>
              )}
            </Grid>
            <Grid container size={12} >
              {selectedPlayer && (
                <Card sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <CardTitleTypography gutterBottom variant="h5">
                      <FormattedMessage id="results" />
                    </CardTitleTypography>
                    <ResultsPanel playerName={selectedPlayer} />
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
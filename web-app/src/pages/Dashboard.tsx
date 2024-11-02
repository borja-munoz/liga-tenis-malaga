import { useState } from "react";

import { Box, Grid2 as Grid, styled, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import { usePlayers } from "../models/model";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { FormattedMessage, useIntl } from "react-intl";
import PlayerSummaryPanel from "../components/PlayerSummaryPanel";
import CycleChart from "../components/CycleChart";

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
            alignItems: "center",
            padding: "20px",
          }}
        >
          <Grid container direction="column" spacing={3}>
            {playerData && (
              <Grid container>
                <Grid size={12}>
                  <span>
                    <FormattedMessage id="players" />: {playerData.length}
                  </span>
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    value={selectedPlayer}
                    onChange={(event: any, newValue: string | null) => {
                      setSelectedPlayer(newValue);
                    }}
                    disablePortal
                    options={playerList}
                    sx={{ width: 345 }}
                    renderInput={(params) => (
                      <TextField {...params} 
                        label={intl.formatMessage({ id: "players" })} />
                    )}
                  />
                </Grid>
            </Grid>
          )}
          {selectedPlayer && (
            <Grid container>
              <Card sx={{ maxWidth: 345 }}>
                <CardContent>
                  <CardTitleTypography gutterBottom variant="h5">
                    <FormattedMessage id="playerSummary" />
                  </CardTitleTypography>
                  <PlayerSummaryPanel playerName={selectedPlayer} />
                </CardContent>
              </Card>
            </Grid>
          )}
          {selectedPlayer && (
            <Grid container>
              <Card sx={{ maxWidth: 345 }}>
                <CardContent>
                  <CardTitleTypography gutterBottom variant="h5">
                    <FormattedMessage id="cycles" />
                  </CardTitleTypography>
                  <CycleChart playerName={selectedPlayer} />
                </CardContent>
              </Card>
            </Grid>
          )}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
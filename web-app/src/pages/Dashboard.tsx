import { useState } from "react";

import { Box, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import { usePlayers } from "../models/model";

import { FormattedMessage, useIntl } from "react-intl";

export default function Dashboard() {
  const [playerData, setPlayerData] = useState<any[]>([]);
  const { data: playerResult, status: statusPlayers } = usePlayers();
  const intl = useIntl();

  if (statusPlayers == "success" && playerData?.length == 0) {
    setPlayerData(playerResult?.toArray());
  }

  const playerList = playerData.map((player) => ({ 
    id: player.id,
    label: player.name,
  }));

  return (
    <Grid container>
      <Grid item xs={9}>
        <Box
          maxWidth="xs"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
          }}
        >
          {playerData && (
            <>
              <span>
                <FormattedMessage id="players" />: {playerData.length}
              </span>
              <Autocomplete
                disablePortal
                options={playerList}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} 
                    label={intl.formatMessage({ id: "players" })} />
                )}
              />
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
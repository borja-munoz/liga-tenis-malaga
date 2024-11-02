import { useEffect, useState } from "react";

import { Grid2 as Grid } from "@mui/material";

import { useCycles } from "../models/model";
import Chart from "./Chart";

type CyclePlayerInfo = {
  group: number;
  cycle: number;
  date: Date;
  season: number;
};

export default function CycleChart({ playerName }: { playerName: string }) {
  const [cycleData, setCycleData] = useState<CyclePlayerInfo[] | null>(null);
  const { data: cyclesResult, status: cyclesStatus } = useCycles(playerName);

  useEffect(() => {
    setCycleData(null);
  }, [playerName]);

  if (cyclesStatus == "success" && cycleData === null) {
    const cycles = cyclesResult?.toArray();
    setCycleData(cycles.map((cycle) => ({
      group: cycle.group_number,
      cycle: cycle.cycle,
      date: cycle.start_date,
      season: cycle.season
    })));
 }

  return (
    <Grid container rowSpacing={3} columnSpacing={1}>
      {cycleData && (
        <Chart
          data={cycleData!}
          xAxisColumn="date"
          yAxisColumn="group"
        />
      )}
    </Grid>
 );
}
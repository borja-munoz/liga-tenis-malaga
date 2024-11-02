import { useEffect, useState } from "react";

import { Grid2 as Grid } from "@mui/material";

import { useCycles } from "../models/model";
import CycleChart from "./CycleChart";

type CyclePlayerInfo = {
  group: number;
  cycle: number;
  date: string;
  season: number;
};

export default function CyclePanel({ playerName }: { playerName: string }) {
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
      date: new Date(cycle.start_date).toLocaleDateString(),
      season: cycle.season
    })));
 }

  return (
    <Grid container rowSpacing={3} columnSpacing={1}>
      {cycleData && (
        <CycleChart
          data={cycleData!}
          xAxisColumn="date"
          yAxisColumn="group"
        />
      )}
    </Grid>
 );
}
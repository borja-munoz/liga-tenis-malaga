import { useEffect, useState } from "react";

import { Grid2 as Grid, styled, Typography } from "@mui/material";

import { useCycles } from "../models/model";
import CycleChart from "./CycleChart";
import { FormattedMessage } from "react-intl";

type CycleChartInfo = {
  group: number;
  cycle: number;
  position: number;
  date: string;
  season: number;
};

type CycleSummaryInfo = {
  seasons: number;
  cycles: number;
  bestGroup: number;
  bestPosition: number;
  totalPoints: number;
};

const GridTitle = styled(Grid)(() => ({
  lineHeight: 0.2,
  minWidth: '55px',
  minHeight: '40px', 
  alignContent: 'center',
}));

const TitleTypography = styled(Typography)(() => ({
  color: "#555555",
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export default function CyclePanel({ playerName }: { playerName: string }) {
  const [cycleSummaryData, setCycleSummaryData] = useState<CycleSummaryInfo | null>(null);
  const [cycleChartData, setCycleChartData] = useState<CycleChartInfo[] | null>(null);
  const { data: cyclesResult, status: cyclesStatus } = useCycles(playerName);

  useEffect(() => {
    setCycleSummaryData(null);
    setCycleChartData(null);
  }, [playerName]);

  if (cyclesStatus == "success" && cycleSummaryData === null) {
    const cycles = cyclesResult?.toArray();

    // Summary data
    let seasonsPlayed = new Set();
    let cyclesPlayed = 0;
    let bestGroup = Number.MAX_VALUE;
    let bestPosition = Number.MAX_VALUE;
    let totalPoints = 0;
    cycles.forEach((cycleInfo) => {
      if (!seasonsPlayed.has(cycleInfo.season)) {
        seasonsPlayed.add(cycleInfo.season);
      }
      cyclesPlayed += 1;
      if (cycleInfo.group_number < bestGroup) {
        bestGroup = cycleInfo.group_number;
      }
      if (cycleInfo.position < bestPosition) {
        bestPosition = cycleInfo.position;
      }
      totalPoints += cycleInfo.points;
    });
    setCycleSummaryData({
      seasons: seasonsPlayed.size,
      cycles: cyclesPlayed,
      bestGroup,
      bestPosition,
      totalPoints
    });

    // Chart data
    setCycleChartData(cycles.map((cycleInfo) => ({
      group: cycleInfo.group_number,
      cycle: cycleInfo.cycle,
      position: cycleInfo.position,
      date: new Date(cycleInfo.start_date).toLocaleDateString(),
      season: cycleInfo.season
    })));
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={1}>
      {cycleSummaryData && (
        <Grid container size={12} direction="column">
          <Grid size={12}>
            <CycleChart
              data={cycleChartData!}
              xAxisColumn="date"
              yAxisColumn="group"
            />
          </Grid>
          <Grid container size={12} direction="row" >
            <Grid container size={{ sm: 4, md: 2}} direction="column" rowSpacing={1}>
              <GridTitle size={6}>
                <TitleTypography variant="caption"><FormattedMessage id="seasons" /></TitleTypography>
              </GridTitle>
              <Grid size={6}>
                <ValueTypography variant="body1">{cycleSummaryData.seasons}</ValueTypography>
              </Grid>
            </Grid>
            <Grid container size={{ sm: 4, md: 2}} direction="column" rowSpacing={1}>
              <GridTitle size={6}>
                <TitleTypography variant="caption"><FormattedMessage id="cycles" /></TitleTypography>
              </GridTitle>
              <Grid size={6}>
                <ValueTypography variant="body1">{cycleSummaryData.cycles}</ValueTypography>
              </Grid>
            </Grid>
            <Grid container size={{ sm: 4, md: 2}} direction="column" rowSpacing={1}>
              <GridTitle size={6}>
                <TitleTypography variant="caption"><FormattedMessage id="bestGroup" /></TitleTypography>
              </GridTitle>
              <Grid size={6}>
                <ValueTypography variant="body1">{cycleSummaryData.bestGroup}</ValueTypography>
              </Grid>
            </Grid>
            <Grid container size={{ sm: 4, md: 2}} direction="column" rowSpacing={1}>
              <GridTitle size={6}>
                <TitleTypography variant="caption"><FormattedMessage id="bestPosition" /></TitleTypography>
              </GridTitle>
              <Grid size={6}>
                <ValueTypography variant="body1">{cycleSummaryData.bestPosition}</ValueTypography>
              </Grid>
            </Grid>
            <Grid container size={{ sm: 4, md: 2}} direction="column" rowSpacing={1}>
              <GridTitle size={6}>
                <TitleTypography variant="caption"><FormattedMessage id="totalPoints" /></TitleTypography>
              </GridTitle>
              <Grid size={6}>
                <ValueTypography variant="body1">{cycleSummaryData.totalPoints}</ValueTypography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
 );
}
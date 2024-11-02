import { Grid2 as Grid } from "@mui/material";
import ReactECharts, { ReactEChartsProps } from "./ReactECharts";

export interface ChartProps {
  data: any[];
  xAxisColumn: string;
  yAxisColumn: string;
}

export default function Chart({ data, xAxisColumn, yAxisColumn }: ChartProps) {
  const option: ReactEChartsProps["option"] = {
    xAxis: {
      type: "category",
      data: data.map((row) => row[xAxisColumn]),
    },
    yAxis: {
      type: "value",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    series: [
      {
        data: data.map((row) => row[yAxisColumn]),
        type: "line",
      },
    ],
  };

  return (
    <Grid container mb={2} sx={{ border: "1px solid #EEEEEE" }}>
      <Grid size={12}>
        <ReactECharts option={option} style={{ height: "40vh" }} />
      </Grid>
    </Grid>
  );
}
import { Grid2 as Grid } from "@mui/material";
import ReactECharts, { ReactEChartsProps } from "./ReactECharts";

export interface ChartProps {
  data: any[];
  xAxisColumn: string;
  yAxisColumn: string;
}

export default function CycleChart({ data, xAxisColumn, yAxisColumn }: ChartProps) {
  const tooltipFormatter = (args: any) => {
    // let row = data[args.seriesId][args.dataIndex];
    let row = data[args[0].dataIndex];
    return 'Season: ' + row.season + '<br />' + 
           'Cycle: ' + row.cycle + '<br />' + 
           'Group: ' + row.group + '<br />' + 
           'Date: ' + row.date;
  };
  const option: ReactEChartsProps["option"] = {
    title: {
      text: "Group",
      padding: [
        10,  // up
        0, // right
        0,  // down
        5, // left
      ],
      textStyle: {
        fontSize: 12,
      }, 
    },
    xAxis: {
      type: "category",
      data: data.map((row) => row[xAxisColumn]),
      position: "top",   
    },
    yAxis: {
      type: "value",
      inverse: true,
      axisTick: { show: true },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: tooltipFormatter,
    },
    grid: {
      left: "5%",
      right: "5%",
    },
    series: [
      {
        data: data.map((row) => row[yAxisColumn]),
        type: "line",
      },
    ],
  };

  return (
    <Grid size={12} container 
      sx={{ 
        minHeight: { flexGrow: 1 },
        minWidth: { flexGrow: 1 }, 
      }}>
      <Grid size={12}>
        <ReactECharts 
          option={option} 
        />
      </Grid>
    </Grid>
  );
}
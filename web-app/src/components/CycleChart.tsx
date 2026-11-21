import { useMemo } from "react";
import { useIntl } from "react-intl";
import { graphic } from "echarts/core";

import ReactECharts, { ReactEChartsProps } from "./ReactECharts";
import { CycleStanding } from "../lib/matches";

interface CycleChartProps {
  data: CycleStanding[];
  bestIndex: number;
}

const YELLOW = "#FFD60A";
const MUTED = "#A9B6D3";

export default function CycleChart({ data, bestIndex }: CycleChartProps) {
  const intl = useIntl();

  const option = useMemo<ReactEChartsProps["option"]>(() => {
    const groups = data.map((r) => r.group);
    const minGroup = Math.min(...groups);
    const maxGroup = Math.max(...groups);
    // First cycle of each season: axis label + dashed divider
    const seasonStarts = data
      .map((r, i) => ({ i, season: r.season }))
      .filter(({ i, season }) => i === 0 || data[i - 1]!.season !== season);

    return {
      animationDuration: 600,
      aria: { enabled: true },
      textStyle: { fontFamily: "Inter, system-ui, sans-serif", color: MUTED },
      grid: { left: 40, right: 16, top: 44, bottom: 28 },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0E2250",
        borderColor: "rgba(255,255,255,.35)",
        textStyle: { color: "#EEF2FB", fontSize: 13 },
        axisPointer: { type: "line", lineStyle: { color: "rgba(255,214,10,.5)" } },
        formatter: (params: any) => {
          const row = data[params[0].dataIndex]!;
          const title = intl.formatMessage({ id: "season.withCycle" }, { season: row.season, cycle: row.cycle });
          const lines = [
            intl.formatMessage({ id: "chart.group" }, { group: row.group }),
            row.position != null ? intl.formatMessage({ id: "chart.position" }, { position: row.position }) : null,
            row.points != null ? intl.formatMessage({ id: "chart.points" }, { points: row.points }) : null,
          ].filter(Boolean);
          return `<strong>${title}</strong><br/>${lines.join("<br/>")}`;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((r) => `T${r.season} C${r.cycle}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: MUTED,
          fontSize: 11,
          fontWeight: 600,
          interval: (index: number) => seasonStarts.some((s) => s.i === index),
          formatter: (_value: string, index: number) => `T${data[index]?.season ?? ""}`,
        },
      },
      yAxis: {
        type: "value",
        inverse: true,
        min: minGroup,
        max: maxGroup,
        minInterval: 1,
        splitNumber: Math.min(4, Math.max(1, maxGroup - minGroup)),
        axisLabel: { color: MUTED, fontSize: 11, formatter: "G{value}" },
        splitLine: { lineStyle: { color: "rgba(255,255,255,.08)" } },
      },
      series: [
        {
          type: "line",
          data: data.map((r, i) =>
            i === bestIndex
              ? {
                  value: r.group,
                  symbolSize: 12,
                  itemStyle: { color: "#FFFFFF", borderColor: YELLOW, borderWidth: 3 },
                  label: {
                    show: true,
                    position: "top",
                    distance: 8,
                    formatter: `T${r.season} C${r.cycle} · G${r.group}`,
                    color: "#0B1B3F",
                    backgroundColor: YELLOW,
                    borderRadius: 6,
                    padding: [4, 8],
                    fontWeight: 700,
                    fontSize: 11,
                  },
                }
              : r.group
          ),
          showSymbol: data.length <= 40,
          showAllSymbol: true,
          symbol: "circle",
          symbolSize: 7,
          itemStyle: { color: "#0B1B3F", borderColor: YELLOW, borderWidth: 2 },
          lineStyle: { color: YELLOW, width: 3 },
          areaStyle: {
            origin: "end",
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(255,214,10,.40)" },
              { offset: 1, color: "rgba(255,214,10,0)" },
            ]),
          },
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: { color: "rgba(255,255,255,.18)", type: "dashed" },
            data: seasonStarts.filter((s) => s.i > 0).map((s) => ({ xAxis: s.i })),
          },
        },
      ],
    };
  }, [data, bestIndex, intl]);

  return (
    <div className="chart">
      <ReactECharts option={option} style={{ minHeight: 0, height: "auto", flex: 1 }} />
    </div>
  );
}

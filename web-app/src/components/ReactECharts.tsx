import { useRef, useEffect } from "react";
import { init, getInstanceByDom, use } from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import type { EChartsType as ECharts, SetOptionOpts } from "echarts/core";
import { Box } from "@mui/material";

// Register only what the app uses (keeps the bundle small for the PWA)
use([LineChart, GridComponent, TooltipComponent, MarkLineComponent, AriaComponent, CanvasRenderer]);

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
}

export default function ReactECharts({
  option,
  style,
  settings,
  loading,
  theme,
}: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    // Resize with the container (layout changes, not only window resizes).
    // Batched in requestAnimationFrame to avoid janky repeated resizes.
    let frame = 0;
    function resizeChart() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => chart?.resize());
    }
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeChart) : null;
    if (observer && chartRef.current) {
      observer.observe(chartRef.current);
    } else {
      window.addEventListener("resize", resizeChart);
    }

    // Return cleanup function
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resizeChart);
      chart?.dispose();
    };
  }, [theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(option, settings);
    }
  }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true ? chart?.showLoading() : chart?.hideLoading();
    }
  }, [loading, theme]);

  return (
    <Box 
      ref={chartRef} 
      sx={{ 
        width: "100%", 
        minHeight: { xs: "300px", sm: "350px" },
        ...style 
      }} 
    />
  );
}
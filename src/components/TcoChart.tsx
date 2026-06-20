import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { QuoteResult } from "../lib/calc";

export function TcoChart({ result }: { result: QuoteResult }) {
  const raw = result.hardwareCost + result.subscriptionCost;
  const scale = raw > 0 ? result.tco / raw : 1;
  const series = [Math.round(result.hardwareCost * scale), Math.round(result.subscriptionCost * scale)];
  const options: ApexOptions = {
    labels: ["하드웨어(1회)", "구독(누적)"],
    colors: ["#ff6a3d", "#3da5ff"],
    fill: { type: "gradient" },
    legend: { labels: { colors: "#fff" }, position: "bottom" },
    dataLabels: { enabled: true, formatter: (_v, o) => (o ? series[o.seriesIndex] || 0 : 0).toLocaleString() + "원" },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: "TCO",
      formatter: () => result.tco.toLocaleString() + "원", color: "#fff" } } } } },
    stroke: { width: 0 },
    chart: { animations: { enabled: true, speed: 800 } },
  };
  return <Chart type="donut" series={series} options={options} height={320} />;
}

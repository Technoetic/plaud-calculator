import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export function PaybackGauge({ paybackMonths }: { paybackMonths: number }) {
  // 회수기간을 36개월 대비 % 게이지로 표현(짧을수록 가득) — 0이면 0%
  const pct = paybackMonths > 0 ? Math.max(0, Math.min(100, (1 - paybackMonths / 36) * 100)) : 0;
  const options: ApexOptions = {
    labels: ["회수 진행도"],
    colors: ["#ff6a3d"],
    fill: { type: "gradient", gradient: { gradientToColors: ["#3da5ff"] } },
    plotOptions: { radialBar: { hollow: { size: "60%" },
      dataLabels: { name: { color: "#fff", offsetY: 24 },
        value: { color: "#fff", fontSize: "22px", offsetY: -8,
          formatter: () => (paybackMonths > 0 ? `${Math.round(paybackMonths * 10) / 10}개월` : "—") } } } },
    stroke: { lineCap: "round" },
    chart: { animations: { enabled: true, speed: 800 } },
  };
  return <Chart type="radialBar" series={[pct]} options={options} height={300} />;
}

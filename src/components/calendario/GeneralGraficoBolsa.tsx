"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { EvolucionMensualItem } from "@/types/general";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

interface GeneralGraficoBolsaProps {
  evolucion: EvolucionMensualItem[];
  moneda: string;
  modoPrivacidad: boolean;
  paletaSobria: boolean;
}

export default function GeneralGraficoBolsa({
  evolucion,
  moneda,
  modoPrivacidad,
  paletaSobria,
}: GeneralGraficoBolsaProps) {
  const { simbolo } = obtenerMonedaInfo(moneda);
  const valores = evolucion.map((e) => e.acumulado);
  const ultimoValor = valores[valores.length - 1] ?? 0;
  const positivo = ultimoValor >= 0;

  const colorLinea = paletaSobria
    ? positivo
      ? "#52b788"
      : "#d97070"
    : positivo
    ? "#34d399"
    : "#f87171";

  const bolsaPlugin: Plugin<"line"> = {
    id: "bolsaCrosshair",
    afterDatasetsDraw(chart) {
      const { ctx, chartArea, scales, tooltip } = chart;
      if (!chartArea || !scales.y) return;

      const yUltimo = scales.y.getPixelForValue(ultimoValor);
      if (yUltimo >= chartArea.top && yUltimo <= chartArea.bottom) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = `${colorLinea}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartArea.left, yUltimo);
        ctx.lineTo(chartArea.right, yUltimo);
        ctx.stroke();
        ctx.restore();
      }

      const active = tooltip?.getActiveElements?.() ?? [];
      if (active.length > 0) {
        const pt = active[0].element;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x, chartArea.top);
        ctx.lineTo(pt.x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      }
    },
  };

  const data: ChartData<"line", number[], string> = {
    labels: evolucion.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Saldo Acumulado",
        data: valores,
        borderColor: colorLinea,
        borderWidth: 2.2,
        tension: 0.08,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colorLinea,
        pointHoverBorderColor: "#0d1322",
        pointHoverBorderWidth: 2,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return `${colorLinea}18`;
          const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, `${colorLinea}38`);
          grad.addColorStop(1, `${colorLinea}02`);
          return grad;
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: '"DM Sans", sans-serif' } },
      },
      y: {
        position: "right",
        grid: { color: "rgba(148, 163, 184, 0.09)" },
        ticks: {
          color: "#94a3b8",
          font: { family: '"JetBrains Mono", monospace', size: 11 },
          callback: (v) =>
            modoPrivacidad
              ? `${simbolo} •••`
              : `${simbolo} ${Number(v).toLocaleString("en-US")}`,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.96)",
        borderColor: "rgba(148, 163, 184, 0.25)",
        borderWidth: 1,
        displayColors: false,
        padding: 9,
        titleFont: { size: 11, weight: "normal", family: '"DM Sans", sans-serif' },
        bodyFont: { size: 13, weight: "bold", family: '"JetBrains Mono", monospace' },
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (ctx) =>
            modoPrivacidad
              ? `${simbolo} •••`
              : formatoMoneda(ctx.parsed.y ?? 0, moneda),
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Line data={data} options={options} plugins={[bolsaPlugin]} />
    </div>
  );
}

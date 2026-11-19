"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatoSoles } from "@/lib/format";
import type { EvolucionMensualItem } from "@/types/general";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface GeneralGraficoEvolucionProps {
  evolucion: EvolucionMensualItem[];
  modoPrivacidad: boolean;
}

export default function GeneralGraficoEvolucion({
  evolucion,
  modoPrivacidad,
}: GeneralGraficoEvolucionProps) {
  if (evolucion.length === 0) {
    return (
      <div className="empty-state">
        Aún no hay suficientes meses registrados para graficar la evolución histórica.
      </div>
    );
  }

  const data = {
    labels: evolucion.map((e) => e.etiqueta),
    datasets: [
      {
        label: "Saldo Acumulado (S/)",
        data: evolucion.map((e) => e.acumulado),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.14)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Ahorro Neto Mensual (S/)",
        data: evolucion.map((e) => e.neto),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.25,
        pointRadius: 3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: '"DM Sans", sans-serif' } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { family: '"DM Sans", sans-serif' },
          callback: (v) =>
            modoPrivacidad
              ? "S/ •••"
              : "S/ " + Number(v).toLocaleString("en-US"),
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { boxWidth: 12, color: "#cbd5e1" },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${
              modoPrivacidad ? "S/ •••" : formatoSoles(ctx.parsed.y ?? 0)
            }`,
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
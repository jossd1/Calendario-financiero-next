"use client";

import { useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import EditableText from "@/components/EditableText";
import { formatoSoles } from "@/lib/format";
import type { ChartDataDTO, TextosUI } from "@/types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

const PALETA_FALLBACK = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#e11d48",
];

interface GraficosFinancierosProps {
  chartData: ChartDataDTO;
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
}

export default function GraficosFinancieros({
  chartData,
  colorPorCategoria,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
}: GraficosFinancierosProps) {
  const [modoFlujo, setModoFlujo] = useState<"barras" | "acumulado">("barras");

  const doughnutData = {
    labels: chartData.categoriasLabels,
    datasets: [
      {
        data: chartData.categoriasValores,
        backgroundColor: chartData.categoriasLabels.map(
          (catNombre, i) =>
            colorPorCategoria.get(catNombre) ??
            PALETA_FALLBACK[i % PALETA_FALLBACK.length]
        ),
        borderColor: "#111827",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 14,
          padding: 16,
          color: "#cbd5e1",
          font: { weight: 600, family: '"DM Sans", sans-serif' },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const datos = ctx.dataset.data;
            const total = datos.reduce((a, b) => a + Number(b), 0);
            const valor = Number(ctx.parsed);
            const pct = total > 0 ? ((valor / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${
              modoPrivacidad ? "S/ •••" : formatoSoles(valor)
            } (${pct}%)`;
          },
        },
      },
    },
  };

  const barData = {
    labels: chartData.flujoLabels,
    datasets: [
      {
        label: "Ingresos (S/)",
        data: chartData.flujoIngresos,
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderRadius: 6,
        maxBarThickness: 26,
      },
      {
        label: "Egresos (S/)",
        data: chartData.flujoEgresos,
        backgroundColor: "rgba(239, 68, 68, 0.85)",
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: '"DM Sans", sans-serif' } },
      },
      y: {
        beginAtZero: true,
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
        labels: {
          boxWidth: 12,
          color: "#cbd5e1",
          font: { family: '"DM Sans", sans-serif' },
        },
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

  const acumuladoSeries = chartData.flujoIngresos.reduce<number[]>(
    (acc, ing, i) => {
      const netoDia = ing - (chartData.flujoEgresos[i] ?? 0);
      const prev = i > 0 ? acc[i - 1] : 0;
      acc.push(Number((prev + netoDia).toFixed(2)));
      return acc;
    },
    []
  );

  const lineData = {
    labels: chartData.flujoLabels,
    datasets: [
      {
        label: "Saldo Acumulado (S/)",
        data: acumuladoSeries,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.14)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
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
        labels: {
          boxWidth: 12,
          color: "#cbd5e1",
          font: { family: '"DM Sans", sans-serif' },
        },
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
    <div className="charts-grid" style={{ marginTop: "16px" }}>
      <article className="panel" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="panel-header">
          <h3 className="panel-title">
            <EditableText
              clave="tituloGraficoDona"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>
        </div>
        {chartData.categoriasLabels.length > 0 ? (
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        ) : (
          <div className="empty-state">No hay egresos en este periodo.</div>
        )}
      </article>

      <article className="panel" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="panel-header">
        <h3 className="panel-title">
          <EditableText
            clave="tituloGraficoBarras"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </h3>
        <div className="mode-pill-group">
          <button
            type="button"
            onClick={() => setModoFlujo("barras")}
            className={`mode-pill-btn ${modoFlujo === "barras" ? "active-fecha" : ""}`}
          >
            Barras
          </button>
          <button
            type="button"
            onClick={() => setModoFlujo("acumulado")}
            className={`mode-pill-btn ${modoFlujo === "acumulado" ? "active-ver-dia" : ""}`}
          >
            Acumulado
          </button>
        </div>
      </div>
      <div className="chart-wrapper">
        {modoFlujo === "barras" ? (
          <Bar data={barData} options={barOptions} />
        ) : (
          <Line data={lineData} options={barOptions as ChartOptions<"line">} />
        )}
      </div>
      </article>
    </div>
  );
}
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
import AppIcon from "@/components/AppIcon";
import EditableText from "@/components/EditableText";
import {
  formatoMoneda,
  mostrarMontoMoneda,
  obtenerMonedaInfo,
} from "@/lib/monedas";
import type { ChartDataDTO, DesgloseCategoria, TextosUI } from "@/types";

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

const PALETA_SOBRIA = [
  "#6b8cae",
  "#689f84",
  "#b58d67",
  "#9a7aa0",
  "#6f9ea3",
  "#a87676",
  "#8794a5",
  "#8fa372",
];

interface GraficosFinancierosProps {
  chartData: ChartDataDTO;
  desgloseEgresos: DesgloseCategoria[];
  moneda: string;
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  paletaSobria: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
}

export default function GraficosFinancieros({
  chartData,
  desgloseEgresos,
  moneda,
  colorPorCategoria,
  modoPrivacidad,
  paletaSobria,
  textos,
  editModeTextos,
  onGuardarTexto,
}: GraficosFinancierosProps) {
  const [modoFlujo, setModoFlujo] = useState<"barras" | "acumulado">("barras");
  const { simbolo } = obtenerMonedaInfo(moneda);

  const colorDeCategoria = (nombre: string, idx: number) =>
    paletaSobria
      ? PALETA_SOBRIA[idx % PALETA_SOBRIA.length]
      : colorPorCategoria.get(nombre) ??
        PALETA_FALLBACK[idx % PALETA_FALLBACK.length];

  const doughnutData = {
    labels: chartData.categoriasLabels,
    datasets: [
      {
        data: chartData.categoriasValores,
        backgroundColor: chartData.categoriasLabels.map((catNombre, i) =>
          colorDeCategoria(catNombre, i)
        ),
        borderColor: "#0d1322",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const datos = ctx.dataset.data;
            const total = datos.reduce((a, b) => a + Number(b), 0);
            const valor = Number(ctx.parsed);
            const pct = total > 0 ? ((valor / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${
              modoPrivacidad ? `${simbolo} •••` : formatoMoneda(valor, moneda)
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
        label: `Ingresos (${simbolo})`,
        data: chartData.flujoIngresos,
        backgroundColor: paletaSobria
          ? "rgba(82, 183, 136, 0.78)"
          : "rgba(16, 185, 129, 0.85)",
        borderRadius: 6,
        maxBarThickness: 26,
      },
      {
        label: `Egresos (${simbolo})`,
        data: chartData.flujoEgresos,
        backgroundColor: paletaSobria
          ? "rgba(217, 112, 112, 0.78)"
          : "rgba(239, 68, 68, 0.85)",
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          callback: (v) =>
            modoPrivacidad
              ? `${simbolo} •••`
              : `${simbolo} ${Number(v).toLocaleString("en-US")}`,
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
              modoPrivacidad
                ? `${simbolo} •••`
                : formatoMoneda(ctx.parsed.y ?? 0, moneda)
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

  const lineColor = paletaSobria ? "#94a3b8" : "#38bdf8";
  const lineData = {
    labels: chartData.flujoLabels,
    datasets: [
      {
        label: `Saldo Acumulado (${simbolo})`,
        data: acumuladoSeries,
        borderColor: lineColor,
        backgroundColor: paletaSobria
          ? "rgba(148, 163, 184, 0.12)"
          : "rgba(56, 189, 248, 0.14)",
        fill: true,
        tension: 0.25,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          callback: (v) =>
            modoPrivacidad
              ? `${simbolo} •••`
              : `${simbolo} ${Number(v).toLocaleString("en-US")}`,
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
              modoPrivacidad
                ? `${simbolo} •••`
                : formatoMoneda(ctx.parsed.y ?? 0, moneda)
            }`,
        },
      },
    },
  };

  return (
    <div className="charts-grid" style={{ marginTop: "16px" }}>
      <article className="analysis-subcard">
        <div className="panel-header">
          <h3
            className="panel-title"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <AppIcon name="resumen" size={16} />
            <EditableText
              clave="tituloGraficoDona"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>
        </div>
        {chartData.categoriasLabels.length > 0 ? (
          <div className="dona-resumen-split">
            <div style={{ position: "relative", height: "220px", width: "100%" }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="dona-resumen-list">
              {desgloseEgresos.map((item, idx) => {
                const colorCat = colorDeCategoria(item.categoria, idx);
                return (
                  <div key={item.categoria} className="dona-resumen-item">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", gap: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                        <span className="cat-color-dot" style={{ backgroundColor: colorCat }} />
                        {item.categoria}
                      </span>
                      <span className={`tabular-nums ${modoPrivacidad ? "privacy-dots" : ""}`} style={{ fontSize: "0.78rem" }}>
                        {mostrarMontoMoneda(item.monto_fmt, modoPrivacidad, moneda)}{" "}
                        <span style={{ color: "var(--text-muted)" }}>({item.porcentaje}%)</span>
                      </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", height: "5px", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ backgroundColor: colorCat, width: `${item.porcentaje}%`, height: "100%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">No hay egresos en este periodo.</div>
        )}
      </article>

      <article className="analysis-subcard">
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
              className={`mode-pill-btn ${modoFlujo === "barras" ? "active-ver-dia" : ""}`}
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
            <Line data={lineData} options={lineOptions} />
          )}
        </div>
      </article>
    </div>
  );
}

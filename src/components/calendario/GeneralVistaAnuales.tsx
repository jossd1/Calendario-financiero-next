"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatoSoles, mostrarMonto } from "@/lib/format";
import type { AnioDetalleItem } from "@/types/general";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface GeneralVistaAnualesProps {
  anios: AnioDetalleItem[];
  modoPrivacidad: boolean;
}

export default function GeneralVistaAnuales({
  anios,
  modoPrivacidad,
}: GeneralVistaAnualesProps) {
  const maskClass = modoPrivacidad ? "privacy-dots" : "";

  if (anios.length === 0) {
    return (
      <div className="empty-state">
        Aún no hay registros históricos anuales para comparar.
      </div>
    );
  }

  const aniosAsc = [...anios].reverse();

  const chartData = {
    labels: aniosAsc.map((a) => String(a.anio)),
    datasets: [
      {
        label: "Ingresos (S/)",
        data: aniosAsc.map((a) => a.ingresos),
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderRadius: 6,
        maxBarThickness: 32,
      },
      {
        label: "Egresos (S/)",
        data: aniosAsc.map((a) => a.egresos),
        backgroundColor: "rgba(239, 68, 68, 0.85)",
        borderRadius: 6,
        maxBarThickness: 32,
      },
      {
        label: "Ahorro Neto (S/)",
        data: aniosAsc.map((a) => a.neto),
        backgroundColor: "rgba(56, 189, 248, 0.85)",
        borderRadius: 6,
        maxBarThickness: 32,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "10px",
          padding: "16px",
        }}
      >
        <h4 className="panel-title" style={{ marginBottom: "12px", fontSize: "0.95rem" }}>
          📆 Comparativa Multi-Año (Ingresos, Egresos y Ahorro Neto)
        </h4>
        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}
      >
        {anios.map((a) => (
          <div
            key={a.anio}
            className="general-mini-card"
            style={{ gap: "8px", padding: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                Año {a.anio}
              </strong>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                {a.cantidad_movimientos} mov.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Ingresos</span>
              <span className={`tabular-nums amt-in ${maskClass}`}>
                {mostrarMonto(formatoSoles(a.ingresos), modoPrivacidad)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Egresos</span>
              <span className={`tabular-nums amt-out ${maskClass}`}>
                {mostrarMonto(formatoSoles(a.egresos), modoPrivacidad)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.86rem",
                borderTop: "1px solid var(--border-hairline)",
                paddingTop: "6px",
                fontWeight: 700,
              }}
            >
              <span>Neto ({a.tasa_ahorro_pct}% ahorro)</span>
              <span className={`tabular-nums ${a.neto >= 0 ? "amt-in" : "amt-out"} ${maskClass}`}>
                {mostrarMonto(formatoSoles(a.neto), modoPrivacidad)}
              </span>
            </div>

            {a.crecimiento_neto_pct !== null && (
              <div
                className={`kpi-delta tabular-nums ${
                  a.crecimiento_neto_pct >= 0 ? "amt-in" : "amt-out"
                }`}
              >
                {a.crecimiento_neto_pct >= 0 ? "▲ +" : "▼ "}
                {a.crecimiento_neto_pct}% ahorro vs año previo
              </div>
            )}

            <div
              style={{
                fontSize: "0.76rem",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginTop: "2px",
              }}
            >
              {a.mejor_mes && (
                <span>
                  Mejor mes: <strong>{a.mejor_mes.etiqueta}</strong> (
                  <span className={`tabular-nums ${maskClass}`}>
                    {mostrarMonto(formatoSoles(a.mejor_mes.neto), modoPrivacidad)}
                  </span>
                  )
                </span>
              )}
              {a.top_categoria && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  Top gasto:
                  <span
                    className="cat-color-dot"
                    style={{ width: "7px", height: "7px", backgroundColor: a.top_categoria.color }}
                  />
                  <strong>{a.top_categoria.nombre}</strong>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
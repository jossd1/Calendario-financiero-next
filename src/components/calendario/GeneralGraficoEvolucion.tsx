"use client";

import { useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import GeneralGraficoBolsa from "@/components/calendario/GeneralGraficoBolsa";
import { buildGeneralChartConfig } from "@/components/calendario/GeneralChartConfig";
import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
import type { EvolucionMensualItem } from "@/types/general";

ChartJS.register(
  BarController,
  LineController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface GeneralGraficoEvolucionProps {
  evolucion: EvolucionMensualItem[];
  moneda: string;
  modoPrivacidad: boolean;
  paletaSobria: boolean;
}

export default function GeneralGraficoEvolucion({
  evolucion,
  moneda,
  modoPrivacidad,
  paletaSobria,
}: GeneralGraficoEvolucionProps) {
  const [modoVista, setModoVista] = useState<"bolsa" | "flujo">("bolsa");
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [mostrarIngresos, setMostrarIngresos] = useState(true);
  const [mostrarEgresos, setMostrarEgresos] = useState(true);

  if (evolucion.length === 0) {
    return (
      <div className="empty-state">
        Aún no hay suficientes meses registrados para graficar la evolución histórica.
      </div>
    );
  }

  const ultimoAcumulado = evolucion[evolucion.length - 1]?.acumulado ?? 0;

  const { data, options } = buildGeneralChartConfig({
    evolucion,
    modoVista: "flujo",
    mostrarSaldo,
    mostrarIngresos,
    mostrarEgresos,
    mostrarNeto: false,
    modoPrivacidad,
    moneda,
  });

  const pillStyle = (activo: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: "0.76rem",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: activo ? "rgba(255, 255, 255, 0.045)" : "transparent",
    border: activo
      ? "1px solid rgba(148, 163, 184, 0.22)"
      : "1px solid rgba(148, 163, 184, 0.08)",
    color: activo ? "#e2e8f0" : "var(--text-muted)",
    opacity: activo ? 1 : 0.45,
    transition: "all 0.15s ease",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h4 className="panel-title" style={{ fontSize: "0.95rem" }}>
            📈 Evolución Histórica Mensual y Saldo Acumulado
          </h4>

          {modoVista === "bolsa" ? (
            <span
              className={`tabular-nums ${
                ultimoAcumulado >= 0 ? "amt-in" : "amt-out"
              } ${modoPrivacidad ? "privacy-dots" : ""}`}
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.04)",
              }}
            >
              Actual:{" "}
              {mostrarMontoMoneda(
                formatoMoneda(ultimoAcumulado, moneda),
                modoPrivacidad,
                moneda
              )}
            </span>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
              <button type="button" onClick={() => setMostrarSaldo((v) => !v)} style={pillStyle(mostrarSaldo)}>
                <span style={{ width: "13px", borderTop: "2px dashed #cbd5e1", display: "inline-block" }} />
                <span>Saldo Acumulado</span>
              </button>
              <button type="button" onClick={() => setMostrarIngresos((v) => !v)} style={pillStyle(mostrarIngresos)}>
                <span className="cat-color-dot" style={{ backgroundColor: "#10b981" }} />
                <span>Ingresos</span>
              </button>
              <button type="button" onClick={() => setMostrarEgresos((v) => !v)} style={pillStyle(mostrarEgresos)}>
                <span className="cat-color-dot" style={{ backgroundColor: "#ef4444" }} />
                <span>Egresos</span>
              </button>
            </div>
          )}
        </div>

        <div className="mode-pill-group">
          <button
            type="button"
            onClick={() => setModoVista("bolsa")}
            className={`mode-pill-btn ${modoVista === "bolsa" ? "active-ver-dia" : ""}`}
          >
            Evolución
          </button>
          <button
            type="button"
            onClick={() => setModoVista("flujo")}
            className={`mode-pill-btn ${modoVista === "flujo" ? "active-ver-dia" : ""}`}
          >
            Ingresos vs Egresos
          </button>
        </div>
      </div>

      {modoVista === "bolsa" ? (
        <GeneralGraficoBolsa
          evolucion={evolucion}
          moneda={moneda}
          modoPrivacidad={modoPrivacidad}
          paletaSobria={paletaSobria}
        />
      ) : (
        <div className="chart-wrapper">
          <Chart type="bar" data={data} options={options} />
        </div>
      )}
    </div>
  );
}

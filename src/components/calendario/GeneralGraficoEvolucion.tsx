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
import { buildGeneralChartConfig } from "@/components/calendario/GeneralChartConfig";
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
}

export default function GeneralGraficoEvolucion({
  evolucion,
  moneda,
  modoPrivacidad,
}: GeneralGraficoEvolucionProps) {
  const [modoVista, setModoVista] = useState<"flujo" | "neto">("flujo");
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [mostrarIngresos, setMostrarIngresos] = useState(true);
  const [mostrarEgresos, setMostrarEgresos] = useState(true);
  const [mostrarNeto, setMostrarNeto] = useState(true);

  if (evolucion.length === 0) {
    return (
      <div className="empty-state">
        Aún no hay suficientes meses registrados para graficar la evolución histórica.
      </div>
    );
  }

  const { data, options } = buildGeneralChartConfig({
    evolucion,
    modoVista,
    mostrarSaldo,
    mostrarIngresos,
    mostrarEgresos,
    mostrarNeto,
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

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={() => setMostrarSaldo((v) => !v)}
              aria-pressed={mostrarSaldo}
              style={pillStyle(mostrarSaldo)}
            >
              <span
                style={{
                  width: "13px",
                  height: "0",
                  borderTop: "2px dashed #cbd5e1",
                  display: "inline-block",
                }}
              />
              <span>Saldo Acumulado</span>
            </button>

            {modoVista === "flujo" ? (
              <>
                <button
                  type="button"
                  onClick={() => setMostrarIngresos((v) => !v)}
                  aria-pressed={mostrarIngresos}
                  style={pillStyle(mostrarIngresos)}
                >
                  <span
                    className="cat-color-dot"
                    style={{ backgroundColor: "#10b981" }}
                  />
                  <span>Ingresos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarEgresos((v) => !v)}
                  aria-pressed={mostrarEgresos}
                  style={pillStyle(mostrarEgresos)}
                >
                  <span
                    className="cat-color-dot"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <span>Egresos</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarNeto((v) => !v)}
                aria-pressed={mostrarNeto}
                style={pillStyle(mostrarNeto)}
              >
                <span
                  className="cat-color-dot"
                  style={{ backgroundColor: "#10b981" }}
                />
                <span>Ahorro Neto</span>
              </button>
            )}
          </div>
        </div>

        <div className="mode-pill-group">
          <button
            type="button"
            onClick={() => setModoVista("flujo")}
            className={`mode-pill-btn ${
              modoVista === "flujo" ? "active-ver-dia" : ""
            }`}
          >
            Ingresos vs Egresos
          </button>
          <button
            type="button"
            onClick={() => setModoVista("neto")}
            className={`mode-pill-btn ${
              modoVista === "neto" ? "active-ver-dia" : ""
            }`}
          >
            Ahorro Neto
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        <Chart type="bar" data={data} options={options} />
      </div>
    </div>
  );
}

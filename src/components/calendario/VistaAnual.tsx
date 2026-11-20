"use client";

import { buildIsoDate, formatoSoles, mostrarMonto } from "@/lib/format";
import type { MesAnual, ModoCalendarioClick } from "@/types";

interface VistaAnualProps {
  anioActual: number;
  mesesAnual: MesAnual[];
  modoClick: ModoCalendarioClick;
  rangoMin: string | null;
  rangoMax: string | null;
  rangoDesde: string | null;
  rangoHasta: string | null;
  modoPrivacidad: boolean;
  onClicMesAnual: (anio: number, mes: number) => void;
}

export default function VistaAnual({
  anioActual,
  mesesAnual,
  modoClick,
  rangoMin,
  rangoMax,
  rangoDesde,
  rangoHasta,
  modoPrivacidad,
  onClicMesAnual,
}: VistaAnualProps) {
  const minYm = rangoMin ? rangoMin.slice(0, 7) : null;
  const maxYm = rangoMax ? rangoMax.slice(0, 7) : null;
  const desdeYm = rangoDesde ? rangoDesde.slice(0, 7) : null;

  return (
    <div className="annual-grid">
      {mesesAnual.map((m) => {
        const ym = buildIsoDate(anioActual, m.mes, 1).slice(0, 7);

        const esInicio =
          modoClick === "analizar_dia" &&
          ((minYm && ym === minYm) || (!rangoHasta && desdeYm === ym));
        const esFin =
          modoClick === "analizar_dia" &&
          Boolean(maxYm && ym === maxYm && maxYm !== minYm);
        const enRango =
          modoClick === "analizar_dia" &&
          Boolean(minYm && maxYm && ym > minYm && ym < maxYm);

        const clases = [
          "month-card",
          enRango ? "is-in-range" : "",
          esInicio ? "is-range-start" : "",
          esFin ? "is-range-end" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={m.mes}
            type="button"
            onClick={() => onClicMesAnual(anioActual, m.mes)}
            className={clases}
            style={{ textAlign: "left" }}
          >
            <span className="month-card-name">{m.nombre}</span>
            <div className="month-card-row">
              <span style={{ color: "var(--text-secondary)" }}>Ingresos</span>
              <span
                className={`tabular-nums amt-in ${
                  modoPrivacidad ? "privacy-dots" : ""
                }`}
              >
                {mostrarMonto(formatoSoles(m.ingresos), modoPrivacidad)}
              </span>
            </div>
            <div className="month-card-row">
              <span style={{ color: "var(--text-secondary)" }}>Egresos</span>
              <span
                className={`tabular-nums amt-out ${
                  modoPrivacidad ? "privacy-dots" : ""
                }`}
              >
                {mostrarMonto(formatoSoles(m.egresos), modoPrivacidad)}
              </span>
            </div>
            <div
              className="month-card-row"
              style={{
                borderTop: "1px solid var(--border-hairline)",
                paddingTop: "6px",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Neto</span>
              <span
                className={`tabular-nums ${
                  m.neto >= 0 ? "amt-in" : "amt-out"
                } ${modoPrivacidad ? "privacy-dots" : ""}`}
              >
                {mostrarMonto(formatoSoles(m.neto), modoPrivacidad)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
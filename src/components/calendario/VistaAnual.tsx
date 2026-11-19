"use client";

import { buildIsoDate, formatoSoles, mostrarMonto } from "@/lib/format";
import type { MesAnual } from "@/types";

interface VistaAnualProps {
  anioActual: number;
  mesesAnual: MesAnual[];
  modoPrivacidad: boolean;
  onAbrirMesEnAnual: (fechaIso: string) => void;
}

export default function VistaAnual({
  anioActual,
  mesesAnual,
  modoPrivacidad,
  onAbrirMesEnAnual,
}: VistaAnualProps) {
  return (
    <div className="annual-grid">
      {mesesAnual.map((m) => (
        <button
          key={m.mes}
          type="button"
          onClick={() => onAbrirMesEnAnual(buildIsoDate(anioActual, m.mes, 1))}
          className="month-card"
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
      ))}
    </div>
  );
}
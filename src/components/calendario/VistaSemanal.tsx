"use client";

import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
import type {
  DiaSemanaDetalle,
  ModoCalendarioClick,
  TransaccionDTO,
} from "@/types";

interface VistaSemanalProps {
  diasSemanaVista: DiaSemanaDetalle[];
  moneda: string;
  diaSeleccionado: string;
  modoClick: ModoCalendarioClick;
  rangoMin: string | null;
  rangoMax: string | null;
  rangoDesde: string | null;
  rangoHasta: string | null;
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  onClicDia: (fechaIso: string) => void;
  onEditarTx: (tx: TransaccionDTO) => void;
}

export default function VistaSemanal({
  diasSemanaVista,
  moneda,
  diaSeleccionado,
  modoClick,
  rangoMin,
  rangoMax,
  rangoDesde,
  rangoHasta,
  colorPorCategoria,
  modoPrivacidad,
  onClicDia,
  onEditarTx,
}: VistaSemanalProps) {
  return (
    <div className="week-grid">
      {diasSemanaVista.map((dia) => {
        const esInicio =
          modoClick === "analizar_dia" &&
          ((rangoMin && dia.fecha_iso === rangoMin) ||
            (!rangoHasta && rangoDesde === dia.fecha_iso));
        const esFin =
          modoClick === "analizar_dia" &&
          Boolean(rangoMax && dia.fecha_iso === rangoMax);
        const enRango =
          modoClick === "analizar_dia" &&
          Boolean(
            rangoMin &&
              rangoMax &&
              dia.fecha_iso > rangoMin &&
              dia.fecha_iso < rangoMax
          );

        const clases = [
          "week-col",
          dia.es_hoy ? "is-today" : "",
          modoClick !== "analizar_dia" && dia.fecha_iso === diaSeleccionado
            ? "is-selected"
            : "",
          enRango ? "is-in-range" : "",
          esInicio ? "is-range-start" : "",
          esFin ? "is-range-end" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={dia.fecha_iso}
            className={clases}
            onMouseDown={(e) => {
              if (modoClick === "precargar") e.preventDefault();
            }}
            onClick={() => onClicDia(dia.fecha_iso)}
            style={{ cursor: "pointer" }}
          >
            <div className="week-col-header">
              <span className="week-col-title">{dia.dia_nombre}</span>
              <span className="week-col-date">{dia.fecha_corta}</span>
            </div>

            <div
              className={modoPrivacidad ? "privacy-dots" : ""}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              {dia.ingresos > 0 && (
                <span className="amt-in">
                  {mostrarMontoMoneda(
                    formatoMoneda(dia.ingresos, moneda),
                    modoPrivacidad,
                    moneda,
                    "+"
                  )}
                </span>
              )}
              {dia.egresos > 0 && (
                <span className="amt-out">
                  {mostrarMontoMoneda(
                    formatoMoneda(dia.egresos, moneda),
                    modoPrivacidad,
                    moneda,
                    "-"
                  )}
                </span>
              )}
              {dia.ingresos === 0 && dia.egresos === 0 && (
                <span style={{ color: "var(--text-muted)" }}>Sin mov.</span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                overflowY: "auto",
                maxHeight: "220px",
              }}
            >
              {dia.items.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditarTx(tx);
                  }}
                  style={{
                    textAlign: "left",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "6px",
                    padding: "5px 7px",
                    fontSize: "0.74rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      className="cat-color-dot"
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor:
                          colorPorCategoria.get(tx.categoria) ?? "#3b82f6",
                      }}
                    />
                    {tx.categoria}
                  </span>
                  <span
                    className={`tabular-nums ${
                      tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                    } ${modoPrivacidad ? "privacy-dots" : ""}`}
                  >
                    {mostrarMontoMoneda(
                      tx.monto_fmt,
                      modoPrivacidad,
                      moneda,
                      tx.tipo === "ingreso" ? "+" : "-"
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

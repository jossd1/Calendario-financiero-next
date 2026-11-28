"use client";

import { DIAS_SEMANA_ES } from "@/lib/format";
import {
  formatoMoneda,
  mostrarMontoMoneda,
  obtenerMonedaInfo,
} from "@/lib/monedas";
import type { CeldaCalendario, ModoCalendarioClick } from "@/types";

interface VistaMensualProps {
  semanasCalendario: CeldaCalendario[][];
  moneda: string;
  diaSeleccionado: string;
  modoClick: ModoCalendarioClick;
  rangoMin: string | null;
  rangoMax: string | null;
  rangoDesde: string | null;
  rangoHasta: string | null;
  alertaTopeDiario: number;
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  onClicDia: (fechaIso: string) => void;
}

export default function VistaMensual({
  semanasCalendario,
  moneda,
  diaSeleccionado,
  modoClick,
  rangoMin,
  rangoMax,
  rangoDesde,
  rangoHasta,
  alertaTopeDiario,
  colorPorCategoria,
  modoPrivacidad,
  onClicDia,
}: VistaMensualProps) {
  const { simbolo } = obtenerMonedaInfo(moneda);

  return (
    <>
      <div className="calendar-weekdays">
        {DIAS_SEMANA_ES.map((diaNombre) => (
          <div key={diaNombre} className="weekday-cell">
            {diaNombre}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {semanasCalendario.flat().map((celda) => {
          const esInicio =
            modoClick === "analizar_dia" &&
            ((rangoMin && celda.fecha_iso === rangoMin) ||
              (!rangoHasta && rangoDesde === celda.fecha_iso));
          const esFin =
            modoClick === "analizar_dia" &&
            Boolean(rangoMax && celda.fecha_iso === rangoMax);
          const enRango =
            modoClick === "analizar_dia" &&
            Boolean(
              rangoMin &&
                rangoMax &&
                celda.fecha_iso > rangoMin &&
                celda.fecha_iso < rangoMax
            );

          const clases = [
            "day-cell",
            !celda.es_mes_actual ? "outside-month" : "",
            celda.es_hoy ? "is-today" : "",
            modoClick !== "analizar_dia" && celda.fecha_iso === diaSeleccionado
              ? "is-selected"
              : "",
            enRango ? "is-in-range" : "",
            esInicio ? "is-range-start" : "",
            esFin ? "is-range-end" : "",
            alertaTopeDiario > 0 && celda.egresos > alertaTopeDiario
              ? "over-daily-limit"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={celda.fecha_iso}
              className={clases}
              role="button"
              tabIndex={modoClick === "precargar" ? -1 : 0}
              onMouseDown={(e) => {
                if (modoClick === "precargar") e.preventDefault();
              }}
              onClick={() => onClicDia(celda.fecha_iso)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClicDia(celda.fecha_iso);
                }
              }}
            >
              <div className="day-header">
                <span className="day-number">{celda.dia}</span>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {alertaTopeDiario > 0 && celda.egresos > alertaTopeDiario && (
                    <span
                      title={`Superó tope diario de ${simbolo} ${alertaTopeDiario}`}
                      style={{ fontSize: "0.72rem" }}
                    >
                      ⚠️
                    </span>
                  )}
                  {celda.cantidad > 0 && (
                    <span className="day-count">{celda.cantidad} mov.</span>
                  )}
                </div>
              </div>

              <div
                className={`day-amounts ${
                  modoPrivacidad ? "privacy-dots" : ""
                }`}
              >
                {celda.ingresos > 0 && (
                  <span className="amt-in">
                    {mostrarMontoMoneda(
                      formatoMoneda(celda.ingresos, moneda),
                      modoPrivacidad,
                      moneda,
                      "+"
                    )}
                  </span>
                )}
                {celda.egresos > 0 && (
                  <span className="amt-out">
                    {mostrarMontoMoneda(
                      formatoMoneda(celda.egresos, moneda),
                      modoPrivacidad,
                      moneda,
                      "-"
                    )}
                  </span>
                )}
                {(celda.ingresos > 0 || celda.egresos > 0) && (
                    <span
                      style={{
                        color:
                          celda.neto >= 0
                            ? "var(--neutral-color)"
                            : "var(--range-end-color)",
                      }}
                    >
                      {mostrarMontoMoneda(
                        formatoMoneda(celda.neto, moneda),
                        modoPrivacidad,
                        moneda
                      )}
                    </span>
                  )}
              </div>

              {celda.cantidad > 0 && (              
                <div className="day-hover-popover">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      borderBottom: "1px solid var(--border-hairline)",
                      paddingBottom: "4px",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>
                      Neto del día
                    </strong>
                    <span
                      className={`tabular-nums ${
                        celda.neto >= 0 ? "amt-in" : "amt-out"
                      } ${modoPrivacidad ? "privacy-dots" : ""}`}
                      style={{ fontWeight: 700 }}
                    >
                      {mostrarMontoMoneda(
                        formatoMoneda(celda.neto, moneda),
                        modoPrivacidad,
                        moneda
                      )}
                    </span>
                  </div>

                  {celda.top_items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.74rem",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          className="cat-color-dot"
                          style={{
                            width: "7px",
                            height: "7px",
                            backgroundColor:
                              colorPorCategoria.get(item.categoria) ??
                              "#3b82f6",
                          }}
                        />
                        {item.descripcion || item.categoria}
                      </span>
                      <span
                        className={`tabular-nums ${
                          item.tipo === "ingreso" ? "amt-in" : "amt-out"
                        } ${modoPrivacidad ? "privacy-dots" : ""}`}
                        style={{ fontWeight: 600, flexShrink: 0 }}
                      >
                        {mostrarMontoMoneda(
                          item.monto_fmt,
                          modoPrivacidad,
                          moneda,
                          item.tipo === "ingreso" ? "+" : "-"
                        )}
                      </span>
                    </div>
                  ))}

                  {celda.cantidad > celda.top_items.length && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textAlign: "right",
                      }}
                    >
                      +{celda.cantidad - celda.top_items.length} más...
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

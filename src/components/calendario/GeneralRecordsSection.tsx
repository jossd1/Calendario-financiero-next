"use client";

import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
import type { AjustesAppConfig } from "@/types";
import type { DatosGeneralDTO } from "@/types/general";

interface GeneralRecordsSectionProps {
  datos: DatosGeneralDTO;
  ajustes: AjustesAppConfig;
}

export default function GeneralRecordsSection({
  datos,
  ajustes,
}: GeneralRecordsSectionProps) {
  const { moneda } = datos;
  const maskClass = ajustes.modoPrivacidad ? "privacy-dots" : "";

  return (
    <>
      <div className="general-two-col">
        {ajustes.generalMostrarRecords && (
          <div className="analysis-subcard" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 className="panel-title" style={{ fontSize: "0.95rem" }}>
              🏆 Récords y Top Categorías Históricas
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                  Mejor Mes (Ahorro)
                </span>
                <strong style={{ fontSize: "0.9rem" }}>
                  {datos.mejor_mes?.etiqueta ?? "—"}
                </strong>
                <span className={`tabular-nums amt-in ${maskClass}`} style={{ fontSize: "0.82rem" }}>
                  {datos.mejor_mes
                    ? mostrarMontoMoneda(
                        formatoMoneda(datos.mejor_mes.neto, moneda),
                        ajustes.modoPrivacidad,
                        moneda
                      )
                    : "—"}
                </span>
              </div>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                  Mes con Mayor Gasto
                </span>
                <strong style={{ fontSize: "0.9rem" }}>
                  {datos.mes_mayor_gasto?.etiqueta ?? "—"}
                </strong>
                <span className={`tabular-nums amt-out ${maskClass}`} style={{ fontSize: "0.82rem" }}>
                  {datos.mes_mayor_gasto
                    ? mostrarMontoMoneda(
                        formatoMoneda(datos.mes_mayor_gasto.egresos, moneda),
                        ajustes.modoPrivacidad,
                        moneda
                      )
                    : "—"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {datos.top_categorias.map((c) => (
                <div key={c.categoria} style={{ fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span className="cat-color-dot" style={{ backgroundColor: c.color }} />
                      {c.categoria}
                    </span>
                    <span className={`tabular-nums ${maskClass}`}>
                      {mostrarMontoMoneda(
                        formatoMoneda(c.monto, moneda),
                        ajustes.modoPrivacidad,
                        moneda
                      )}{" "}
                      ({c.porcentaje}%)
                    </span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", height: "5px", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: c.color, width: `${c.porcentaje}%`, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ajustes.generalMostrarAnual && (
          <div className="analysis-subcard" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h4 className="panel-title" style={{ fontSize: "0.95rem" }}>
              📅 Comparativa Año vs Año
            </h4>
            <div className="table-scroll">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Año</th>
                    <th className="num">Ingresos</th>
                    <th className="num">Egresos</th>
                    <th className="num">Neto</th>
                    <th className="num">Ahorro</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.comparativa_anual.length > 0 ? (
                    datos.comparativa_anual.map((a) => (
                      <tr key={a.anio}>
                        <td className="tabular-nums" style={{ fontWeight: 700 }}>
                          {a.anio}
                        </td>
                        <td className={`num tabular-nums amt-in ${maskClass}`}>
                          {mostrarMontoMoneda(
                            formatoMoneda(a.ingresos, moneda),
                            ajustes.modoPrivacidad,
                            moneda
                          )}
                        </td>
                        <td className={`num tabular-nums amt-out ${maskClass}`}>
                          {mostrarMontoMoneda(
                            formatoMoneda(a.egresos, moneda),
                            ajustes.modoPrivacidad,
                            moneda
                          )}
                        </td>
                        <td className={`num tabular-nums ${a.neto >= 0 ? "amt-in" : "amt-out"} ${maskClass}`}>
                          {mostrarMontoMoneda(
                            formatoMoneda(a.neto, moneda),
                            ajustes.modoPrivacidad,
                            moneda
                          )}
                        </td>
                        <td className="num tabular-nums">{a.tasa_ahorro_pct}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">Sin datos anuales.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {ajustes.generalMostrarRecords && datos.top_movimientos.length > 0 && (
        <div className="analysis-subcard" style={{ marginTop: "16px" }}>
          <h4 className="panel-title" style={{ fontSize: "0.95rem", marginBottom: "10px" }}>
            💎 Top 5 Movimientos Históricos
          </h4>
          <div className="table-scroll">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="num">Monto ({moneda})</th>
                </tr>
              </thead>
              <tbody>
                {datos.top_movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className="tabular-nums" style={{ fontSize: "0.82rem" }}>
                      {m.fecha_fmt}
                    </td>
                    <td>
                      <span
                        className={m.tipo === "ingreso" ? "amt-in" : "amt-out"}
                        style={{ fontWeight: 600 }}
                      >
                        {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td>{m.categoria}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {m.descripcion || "—"}
                    </td>
                    <td
                      className={`num tabular-nums ${
                        m.tipo === "ingreso" ? "amt-in" : "amt-out"
                      } ${maskClass}`}
                      style={{ fontWeight: 700 }}
                    >
                      {mostrarMontoMoneda(
                        m.monto_fmt,
                        ajustes.modoPrivacidad,
                        moneda,
                        m.tipo === "ingreso" ? "+" : "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import EditableText from "@/components/EditableText";
import GeneralGraficoEvolucion from "@/components/calendario/GeneralGraficoEvolucion";
import GeneralVistaAnuales from "@/components/calendario/GeneralVistaAnuales";
import { formatoSoles, mostrarMonto } from "@/lib/format";
import type { AjustesAppConfig, TextosUI } from "@/types";
import type { DatosGeneralDTO } from "@/types/general";

interface VistaGeneralProps {
  datos: DatosGeneralDTO;
  ajustes: AjustesAppConfig;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onToggleConsolidado: (consolidado: boolean) => void;
}

export default function VistaGeneral({
  datos,
  ajustes,
  textos,
  editModeTextos,
  onGuardarTexto,
  onToggleConsolidado,
}: VistaGeneralProps) {
  const [subVista, setSubVista] = useState<"panorama" | "anuales">("panorama");
  const maskClass = ajustes.modoPrivacidad ? "privacy-dots" : "";

  return (
    <section className="panel" id="calendario">
      <div className="panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h3 className="panel-title">
            <EditableText
              clave="tituloVistaGeneral"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>
          <span className="period-badge-inline">
            {datos.cantidad_movimientos} mov. · {datos.meses_activos} mes(es)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div className="mode-pill-group">
            <button
              type="button"
              className={`mode-pill-btn ${subVista === "panorama" ? "active-fecha" : ""}`}
              onClick={() => setSubVista("panorama")}
            >
              📊 Panorama
            </button>
            <button
              type="button"
              className={`mode-pill-btn ${subVista === "anuales" ? "active-analizar" : ""}`}
              onClick={() => setSubVista("anuales")}
            >
              📆 Todos los Años
            </button>
          </div>

          {ajustes.generalPermitirConsolidado && (
            <div className="mode-pill-group">
              <button
                type="button"
                className={`mode-pill-btn ${!datos.consolidado ? "active-fecha" : ""}`}
                onClick={() => onToggleConsolidado(false)}
              >
                Solo Perfil Actual
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${datos.consolidado ? "active-ver-dia" : ""}`}
                onClick={() => onToggleConsolidado(true)}
              >
                🌐 Todos los Perfiles
              </button>
            </div>
          )}
        </div>
      </div>

      {subVista === "anuales" ? (
        <GeneralVistaAnuales
          anios={datos.detalle_anuales}
          modoPrivacidad={ajustes.modoPrivacidad}
        />
      ) : (
        <>
          {ajustes.generalMostrarAhorro && (
            <div className="general-stats-grid" style={{ marginBottom: "20px" }}>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Tasa de Ahorro Global
                </span>
                <strong
                  className={`tabular-nums ${
                    datos.tasa_ahorro_pct >= 0 ? "amt-in" : "amt-out"
                  }`}
                  style={{ fontSize: "1.35rem" }}
                >
                  {datos.tasa_ahorro_pct}%
                </strong>
              </div>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Ingreso Mensual Prom.
                </span>
                <strong className={`tabular-nums amt-in ${maskClass}`} style={{ fontSize: "1.2rem" }}>
                  {mostrarMonto(formatoSoles(datos.ingreso_mensual_prom), ajustes.modoPrivacidad)}
                </strong>
              </div>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Egreso Mensual Prom.
                </span>
                <strong className={`tabular-nums amt-out ${maskClass}`} style={{ fontSize: "1.2rem" }}>
                  {mostrarMonto(formatoSoles(datos.egreso_mensual_prom), ajustes.modoPrivacidad)}
                </strong>
              </div>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Ahorro Neto Prom. / Mes
                </span>
                <strong
                  className={`tabular-nums ${
                    datos.ahorro_mensual_prom >= 0 ? "amt-in" : "amt-out"
                  } ${maskClass}`}
                  style={{ fontSize: "1.2rem" }}
                >
                  {mostrarMonto(formatoSoles(datos.ahorro_mensual_prom), ajustes.modoPrivacidad)}
                </strong>
              </div>
            </div>
          )}

          {ajustes.generalMostrarEvolucion && (
            <div
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <GeneralGraficoEvolucion
                evolucion={datos.evolucion_mensual}
                modoPrivacidad={ajustes.modoPrivacidad}
              />
            </div>
          )}

          <div className="general-two-col">
            {ajustes.generalMostrarRecords && (
              <div
                style={{
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <h4 className="panel-title" style={{ fontSize: "0.95rem" }}>
                  🏆 Récords y Top Categorías Históricas
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="general-mini-card">
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      Mejor Mes (Ahorro)
                    </span>
                    <strong style={{ fontSize: "0.9rem" }}>{datos.mejor_mes?.etiqueta ?? "—"}</strong>
                    <span className={`tabular-nums amt-in ${maskClass}`} style={{ fontSize: "0.82rem" }}>
                      {datos.mejor_mes
                        ? mostrarMonto(formatoSoles(datos.mejor_mes.neto), ajustes.modoPrivacidad)
                        : "—"}
                    </span>
                  </div>
                  <div className="general-mini-card">
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      Mes con Mayor Gasto
                    </span>
                    <strong style={{ fontSize: "0.9rem" }}>{datos.mes_mayor_gasto?.etiqueta ?? "—"}</strong>
                    <span className={`tabular-nums amt-out ${maskClass}`} style={{ fontSize: "0.82rem" }}>
                      {datos.mes_mayor_gasto
                        ? mostrarMonto(formatoSoles(datos.mes_mayor_gasto.egresos), ajustes.modoPrivacidad)
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
                          {mostrarMonto(formatoSoles(c.monto), ajustes.modoPrivacidad)} ({c.porcentaje}%)
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
              <div
                style={{
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
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
                            <td className="tabular-nums" style={{ fontWeight: 700 }}>{a.anio}</td>
                            <td className={`num tabular-nums amt-in ${maskClass}`}>
                              {mostrarMonto(formatoSoles(a.ingresos), ajustes.modoPrivacidad)}
                            </td>
                            <td className={`num tabular-nums amt-out ${maskClass}`}>
                              {mostrarMonto(formatoSoles(a.egresos), ajustes.modoPrivacidad)}
                            </td>
                            <td className={`num tabular-nums ${a.neto >= 0 ? "amt-in" : "amt-out"} ${maskClass}`}>
                              {mostrarMonto(formatoSoles(a.neto), ajustes.modoPrivacidad)}
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
            <div
              style={{
                marginTop: "16px",
                background: "rgba(0,0,0,0.18)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
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
                      <th className="num">Monto (S/)</th>
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
                          {mostrarMonto(
                            m.monto_fmt,
                            ajustes.modoPrivacidad,
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
      )}
    </section>
  );
}
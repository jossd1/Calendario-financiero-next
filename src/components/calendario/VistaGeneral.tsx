"use client";

import { useState } from "react";
import EditableText from "@/components/EditableText";
import GeneralGraficoEvolucion from "@/components/calendario/GeneralGraficoEvolucion";
import GeneralRecordsSection from "@/components/calendario/GeneralRecordsSection";
import GeneralVistaAnuales from "@/components/calendario/GeneralVistaAnuales";
import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
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
  const { moneda } = datos;
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
            {datos.cantidad_movimientos} mov. · {datos.meses_activos} mes(es) · {moneda}
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
                🌐 Todos ({moneda})
              </button>
            </div>
          )}
        </div>
      </div>

      {datos.consolidado && datos.perfiles_omitidos > 0 && (
        <div
          style={{
            marginBottom: "14px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            fontSize: "0.78rem",
            color: "var(--neutral-color)",
          }}
        >
          Consolidando {datos.perfiles_incluidos} perfil(es) en{" "}
          <strong>{moneda}</strong>. Se omitieron {datos.perfiles_omitidos}{" "}
          perfil(es) con distinta moneda para no mezclar divisas.
        </div>
      )}

      {subVista === "anuales" ? (
        <GeneralVistaAnuales
          anios={datos.detalle_anuales}
          moneda={moneda}
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
                  {mostrarMontoMoneda(
                    formatoMoneda(datos.ingreso_mensual_prom, moneda),
                    ajustes.modoPrivacidad,
                    moneda
                  )}
                </strong>
              </div>
              <div className="general-mini-card">
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Egreso Mensual Prom.
                </span>
                <strong className={`tabular-nums amt-out ${maskClass}`} style={{ fontSize: "1.2rem" }}>
                  {mostrarMontoMoneda(
                    formatoMoneda(datos.egreso_mensual_prom, moneda),
                    ajustes.modoPrivacidad,
                    moneda
                  )}
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
                  {mostrarMontoMoneda(
                    formatoMoneda(datos.ahorro_mensual_prom, moneda),
                    ajustes.modoPrivacidad,
                    moneda
                  )}
                </strong>
              </div>
            </div>
          )}

          {ajustes.generalMostrarEvolucion && (
            <div className="analysis-subcard" style={{ marginBottom: "20px" }}>
              <GeneralGraficoEvolucion
                evolucion={datos.evolucion_mensual}
                moneda={moneda}
                modoPrivacidad={ajustes.modoPrivacidad}
                paletaSobria={ajustes.paletaSobria}
              />
              
            </div>
          )}

          <GeneralRecordsSection datos={datos} ajustes={ajustes} />
        </>
      )}
    </section>
  );
}

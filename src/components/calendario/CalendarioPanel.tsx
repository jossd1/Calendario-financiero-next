"use client";

import { useMemo } from "react";
import EditableText from "@/components/EditableText";
import VistaAnual from "@/components/calendario/VistaAnual";
import VistaDia from "@/components/calendario/VistaDia";
import VistaMensual from "@/components/calendario/VistaMensual";
import VistaSemanal from "@/components/calendario/VistaSemanal";
import type {
  CategoriaDTO,
  CeldaCalendario,
  DiaSemanaDetalle,
  MesAnual,
  ModoCalendarioClick,
  TextosUI,
  TransaccionDTO,
  VistaCalendario,
} from "@/types";

interface CalendarioPanelProps {
  vista: VistaCalendario;
  fechaRef: string;
  tituloPeriodo: string;
  moneda: string;
  diaSeleccionado: string;
  modoClick: ModoCalendarioClick;
  rangoDesde: string | null;
  rangoHasta: string | null;
  semanasCalendario: CeldaCalendario[][] | null;
  diasSemanaVista: DiaSemanaDetalle[] | null;
  mesesAnual: MesAnual[] | null;
  transaccionesDia: TransaccionDTO[];
  categorias: CategoriaDTO[];
  hoverPreviewDia: boolean;
  mostrarNetoCeldas: boolean;
  alertaTopeDiario: number;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarModoClick: (modo: ModoCalendarioClick) => void;
  onAbrirBuscadorMagico: () => void;
  onClicDia: (fechaIso: string) => void;
  onClicMesAnual: (anio: number, mes: number) => void;
  onVolverAlMes: () => void;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function CalendarioPanel({
  vista,
  fechaRef,
  tituloPeriodo,
  moneda,
  diaSeleccionado,
  modoClick,
  rangoDesde,
  rangoHasta,
  semanasCalendario,
  diasSemanaVista,
  mesesAnual,
  transaccionesDia,
  categorias,
  hoverPreviewDia,
  mostrarNetoCeldas,
  alertaTopeDiario,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarModoClick,
  onAbrirBuscadorMagico,
  onClicDia,
  onClicMesAnual,
  onVolverAlMes,
  onEditarTx,
  onEliminarTx,
}: CalendarioPanelProps) {
  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of categorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [categorias]);

  const anioActual = Number(fechaRef.slice(0, 4));
  let rangoMin: string | null = null;
  let rangoMax: string | null = null;
  if (rangoDesde && rangoHasta) {
    rangoMin = rangoDesde <= rangoHasta ? rangoDesde : rangoHasta;
    rangoMax = rangoDesde <= rangoHasta ? rangoHasta : rangoDesde;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h3 className="panel-title">
            {vista === "dia" ? (
              <EditableText
                clave="tituloDesgloseDia"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            ) : vista === "semana" ? (
              <EditableText
                clave="tituloVistaSemanal"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            ) : vista === "anual" ? (
              <EditableText
                clave="tituloResumenAnual"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            ) : (
              <EditableText
                clave="tituloCalendarioMensual"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            )}
          </h3>
          <span className="period-badge-inline">
            <span style={{ fontSize: "1.1rem" }}>📅</span>
            <span>{tituloPeriodo}</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onAbrirBuscadorMagico}
            className="magic-search-btn"
            title="Buscador rápido de fecha (Ctrl+K)"
            aria-label="Buscador rápido de fecha"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="magicLens" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <circle cx="11" cy="11" r="7" stroke="url(#magicLens)" strokeWidth="2.3" />
              <path d="M16.5 16.5L21 21" stroke="url(#magicLens)" strokeWidth="2.3" strokeLinecap="round" />
            </svg>
          </button>

          {vista === "dia" ? (
            <button
              type="button"
              onClick={() => {
                if (!editModeTextos) onVolverAlMes();
              }}
              className="btn btn-sm btn-volver-mes"
            >
              <EditableText
                clave="btnVolverAlMes"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </button>
          ) : (
            <div className="mode-pill-group" role="group" aria-label="Modo de clic">
              <button
                type="button"
                onMouseDown={(e) => {
                  if (!editModeTextos) e.preventDefault();
                }}
                onClick={() => {
                  if (!editModeTextos) onCambiarModoClick("precargar");
                }}
                className={`mode-pill-btn ${
                  modoClick === "precargar" ? "active-fecha" : ""
                }`}
              >
                <EditableText
                  clave="modoFecha"
                  textos={textos}
                  editMode={editModeTextos}
                  onGuardarTexto={onGuardarTexto}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editModeTextos) onCambiarModoClick("ver_dia");
                }}
                className={`mode-pill-btn ${
                  modoClick === "ver_dia" ? "active-ver-dia" : ""
                }`}
              >
                <EditableText
                  clave="modoVerDia"
                  textos={textos}
                  editMode={editModeTextos}
                  onGuardarTexto={onGuardarTexto}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editModeTextos) onCambiarModoClick("analizar_dia");
                }}
                className={`mode-pill-btn ${
                  modoClick === "analizar_dia" ? "active-analizar" : ""
                }`}
              >
                <EditableText
                  clave="modoAnalizar"
                  textos={textos}
                  editMode={editModeTextos}
                  onGuardarTexto={onGuardarTexto}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {(vista === "mensual" || vista === "semana" || vista === "anual") &&
        modoClick === "analizar_dia" && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 12px",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              fontSize: "0.78rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span>
              {!rangoDesde
                ? "1er toque: selecciona Desde (Cian). Puedes alternar entre Mensual y Anual."
                : !rangoHasta
                ? `Desde: ${rangoDesde} — Toca Hasta (Ámbar) en Mensual o Anual.`
                : `Rango: ${rangoMin} al ${rangoMax}. Toca otro punto para un nuevo rango.`}
            </span>
            <div style={{ display: "flex", gap: "12px", fontWeight: 600 }}>
              <span style={{ color: "var(--neutral-color)" }}>● Desde</span>
              <span style={{ color: "var(--range-end-color)" }}>● Hasta</span>
            </div>
          </div>
        )}

      {vista === "mensual" && semanasCalendario && (
        <VistaMensual
          semanasCalendario={semanasCalendario}
          moneda={moneda}
          diaSeleccionado={diaSeleccionado}
          modoClick={modoClick}
          rangoMin={rangoMin}
          rangoMax={rangoMax}
          rangoDesde={rangoDesde}
          rangoHasta={rangoHasta}
          hoverPreviewDia={hoverPreviewDia}
          mostrarNetoCeldas={mostrarNetoCeldas}
          alertaTopeDiario={alertaTopeDiario}
          colorPorCategoria={colorPorCategoria}
          modoPrivacidad={modoPrivacidad}
          onClicDia={onClicDia}
        />
      )}

      {vista === "semana" && diasSemanaVista && (
        <VistaSemanal
          diasSemanaVista={diasSemanaVista}
          moneda={moneda}
          diaSeleccionado={diaSeleccionado}
          modoClick={modoClick}
          rangoMin={rangoMin}
          rangoMax={rangoMax}
          rangoDesde={rangoDesde}
          rangoHasta={rangoHasta}
          colorPorCategoria={colorPorCategoria}
          modoPrivacidad={modoPrivacidad}
          onClicDia={onClicDia}
          onEditarTx={onEditarTx}
        />
      )}

      {vista === "dia" && (
        <VistaDia
          transaccionesDia={transaccionesDia}
          moneda={moneda}
          colorPorCategoria={colorPorCategoria}
          modoPrivacidad={modoPrivacidad}
          onEditarTx={onEditarTx}
          onEliminarTx={onEliminarTx}
        />
      )}

      {vista === "anual" && mesesAnual && (
        <VistaAnual
          anioActual={anioActual}
          moneda={moneda}
          mesesAnual={mesesAnual}
          modoClick={modoClick}
          rangoMin={rangoMin}
          rangoMax={rangoMax}
          rangoDesde={rangoDesde}
          rangoHasta={rangoHasta}
          modoPrivacidad={modoPrivacidad}
          onClicMesAnual={onClicMesAnual}
        />
      )}
    </div>
  );
}

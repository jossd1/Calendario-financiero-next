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
  modoPrivacidad: boolean;
  textos: TextosUI;
  mostrarNetoCeldas: boolean;
  alertaTopeDiario: number;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarModoClick: (modo: ModoCalendarioClick) => void;
  onClicDia: (fechaIso: string) => void;
  onVolverAlMes: () => void;
  onAbrirMesEnAnual: (fechaIso: string) => void;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function CalendarioPanel({
  vista,
  fechaRef,
  tituloPeriodo,
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
  modoPrivacidad,
  textos,
  editModeTextos,
  mostrarNetoCeldas,
  alertaTopeDiario,
  onGuardarTexto,
  onCambiarModoClick,
  onClicDia,
  onVolverAlMes,
  onAbrirMesEnAnual,
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
            gap: "10px",
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
          <span className="period-badge-inline">📅 {tituloPeriodo}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
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

      {(vista === "mensual" || vista === "semana") &&
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
                ? "1er toque: selecciona la fecha Desde (Cian)."
                : !rangoHasta
                ? `Desde: ${rangoDesde} — Ahora toca la fecha Hasta (Ámbar).`
                : `Rango seleccionado: ${rangoMin} al ${rangoMax}. Toca otro día para iniciar un nuevo rango.`}
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
          diaSeleccionado={diaSeleccionado}
          modoClick={modoClick}
          rangoMin={rangoMin}
          rangoMax={rangoMax}
          rangoDesde={rangoDesde}
          rangoHasta={rangoHasta}
          hoverPreviewDia={hoverPreviewDia}
          colorPorCategoria={colorPorCategoria}
          modoPrivacidad={modoPrivacidad}
          onClicDia={onClicDia}
          mostrarNetoCeldas={mostrarNetoCeldas}
                alertaTopeDiario={alertaTopeDiario}
        />
      )}

      {vista === "semana" && diasSemanaVista && (
        <VistaSemanal
          diasSemanaVista={diasSemanaVista}
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
          colorPorCategoria={colorPorCategoria}
          modoPrivacidad={modoPrivacidad}
          onEditarTx={onEditarTx}
          onEliminarTx={onEliminarTx}
        />
      )}

      {vista === "anual" && mesesAnual && (
        <VistaAnual
          anioActual={anioActual}
          mesesAnual={mesesAnual}
          modoPrivacidad={modoPrivacidad}
          onAbrirMesEnAnual={onAbrirMesEnAnual}
        />
      )}
    </div>
  );
}
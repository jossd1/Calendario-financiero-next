"use client";

import type { VistaCalendario } from "@/types";

interface WorkspaceToolbarProps {
  vista: VistaCalendario;
  tituloPeriodo: string;
  fechaAnterior: string;
  fechaSiguiente: string;
  vistaSemanalActiva: boolean;
  vistaGeneralActiva: boolean;
  onCambiarVista: (vista: VistaCalendario) => void;
  onNavegarPeriodo: (fecha: string) => void;
  onIrHoy: () => void;
}

export default function WorkspaceToolbar({
  vista,
  tituloPeriodo,
  fechaAnterior,
  fechaSiguiente,
  vistaSemanalActiva,
  vistaGeneralActiva,
  onCambiarVista,
  onNavegarPeriodo,
  onIrHoy,
}: WorkspaceToolbarProps) {
  return (
    <section className="workspace-toolbar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div className="view-tabs" role="tablist">
          <button
            type="button"
            className={`view-tab ${vista === "dia" ? "active" : ""}`}
            onClick={() => onCambiarVista("dia")}
          >
            Día
          </button>
          {vistaSemanalActiva && (
            <button
              type="button"
              className={`view-tab ${vista === "semana" ? "active" : ""}`}
              onClick={() => onCambiarVista("semana")}
            >
              Semana
            </button>
          )}
          <button
            type="button"
            className={`view-tab ${vista === "mensual" ? "active" : ""}`}
            onClick={() => onCambiarVista("mensual")}
          >
            Mensual
          </button>
          <button
            type="button"
            className={`view-tab ${vista === "anual" ? "active" : ""}`}
            onClick={() => onCambiarVista("anual")}
          >
            Anual
          </button>
        </div>

        {vistaGeneralActiva && (
          <button
            type="button"
            className={`view-tab-general ${vista === "general" ? "active" : ""}`}
            onClick={() => onCambiarVista("general")}
            title="Resumen histórico completo de todo tu historial"
          >
            🌐 General
          </button>
        )}
      </div>

      {vista !== "general" ? (
        <div className="period-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavegarPeriodo(fechaAnterior)}
          >
            Anterior
          </button>
          <span className="period-label">{tituloPeriodo}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavegarPeriodo(fechaSiguiente)}
          >
            Siguiente
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onIrHoy}
          >
            Hoy
          </button>
        </div>
      ) : (
        <span className="period-badge-inline">
          🌐 Historial Acumulado Total
        </span>
      )}
    </section>
  );
}
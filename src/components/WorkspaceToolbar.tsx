"use client";

import type { SubperfilDTO, VistaCalendario } from "@/types";

interface WorkspaceToolbarProps {
  vista: VistaCalendario;
  tituloPeriodo: string;
  fechaAnterior: string;
  fechaSiguiente: string;
  vistaSemanalActiva: boolean;
  subperfiles: SubperfilDTO[];
  subperfilActivoId: number | null;
  onCambiarVista: (vista: VistaCalendario) => void;
  onCambiarSubperfil: (subperfilId: number | null) => void;
  onNavegarPeriodo: (fecha: string) => void;
  onIrHoy: () => void;
}

export default function WorkspaceToolbar({
  vista,
  tituloPeriodo,
  fechaAnterior,
  fechaSiguiente,
  vistaSemanalActiva,
  subperfiles,
  subperfilActivoId,
  onCambiarVista,
  onCambiarSubperfil,
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

        <button
          type="button"
          className={`view-tab-general ${vista === "general" ? "active" : ""}`}
          onClick={() => onCambiarVista("general")}
          title="Resumen histórico completo de todo tu historial"
        >
          🌐 General
        </button>

        {subperfiles.length > 0 && (
          <div className="mode-pill-group" role="group" aria-label="Filtrar subperfil">
            <button
              type="button"
              onClick={() => onCambiarSubperfil(null)}
              className={`mode-pill-btn ${
                subperfilActivoId === null ? "active-fecha" : ""
              }`}
            >
              Todos
            </button>
            {subperfiles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onCambiarSubperfil(s.id)}
                className={`mode-pill-btn ${
                  subperfilActivoId === s.id ? "active-ver-dia" : ""
                }`}
                title={`Filtrar por ${s.nombre} (atajo: ${s.atajo})`}
              >
                {s.icono} {s.nombre}
              </button>
            ))}
          </div>
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

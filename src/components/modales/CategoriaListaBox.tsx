"use client";

import AppIcon from "@/components/AppIcon";
import type { CategoriaDTO } from "@/types";

interface CategoriaListaBoxProps {
  titulo: string;
  colorTitulo: string;
  lista: CategoriaDTO[];
  armadoNombre: string | null;
  onIniciarEdicion: (cat: CategoriaDTO) => void;
  onEliminar: (nombre: string) => Promise<void>;
}

export default function CategoriaListaBox({
  titulo,
  colorTitulo,
  lista,
  armadoNombre,
  onIniciarEdicion,
  onEliminar,
}: CategoriaListaBoxProps) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #111a2e 0%, #0a101d 100%)",
        border: "1px solid rgba(56, 189, 248, 0.22)",
        padding: "0.75rem",
        borderRadius: "12px",
      }}
    >
      <h4
        style={{
          fontSize: "0.74rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "0.55rem",
          paddingLeft: "6px",
          color: colorTitulo,
        }}
      >
        {titulo}
      </h4>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        {lista.map((cat) => (
          <li
            key={cat.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.025)",
              padding: "6px 9px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              color: "#e2e8f0",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minWidth: 0,
              }}
            >
              <span
                className="cat-color-dot"
                style={{ backgroundColor: cat.color || "#3b82f6" }}
              />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cat.nombre}
              </span>
              <code
                className="tabular-nums"
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                [{cat.atajo}]
              </code>
            </span>
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onIniciarEdicion(cat)}
                style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                title="Editar"
              >
                ✏️
              </button>
              <button
                type="button"
                className={`btn btn-danger btn-sm ${
                  armadoNombre === cat.nombre ? "btn-danger-armed" : ""
                }`}
                onClick={() => void onEliminar(cat.nombre)}
                style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                title="Eliminar"
              >
                {armadoNombre === cat.nombre ? (
                  "⚠️"
                ) : (
                  <AppIcon name="papelera" size={13} />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
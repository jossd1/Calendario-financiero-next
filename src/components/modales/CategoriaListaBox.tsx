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
        background: "rgba(255, 255, 255, 0.02)",
        padding: "0.75rem",
        borderRadius: "8px",
      }}
    >
      <h4
        style={{
          fontSize: "0.85rem",
          marginBottom: "0.5rem",
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
          gap: "0.4rem",
        }}
      >
        {lista.map((cat) => (
          <li
            key={cat.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.03)",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                className="cat-color-dot"
                style={{ backgroundColor: cat.color || "#3b82f6" }}
              />
              {cat.nombre}{" "}
              <code style={{ color: "var(--accent-primary)" }}>
                [{cat.atajo}]
              </code>
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onIniciarEdicion(cat)}
                style={{ padding: "1px 5px", fontSize: "0.7rem" }}
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
                style={{ padding: "1px 5px", fontSize: "0.7rem" }}
                title="Eliminar"
              >
                {armadoNombre === cat.nombre ? (
                  "⚠️ ¿Seguro?"
                ) : (
                  <AppIcon name="eliminar" size={13} />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
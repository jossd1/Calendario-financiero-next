"use client";

import { useEffect, useState } from "react";
import type { CategoriaDTO, TipoMovimiento } from "@/types";

interface ModalCategoriasProps {
  abierto: boolean;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalCategorias({
  abierto,
  categoriasEgreso,
  categoriasIngreso,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalCategoriasProps) {
  const [nuevoTipo, setNuevoTipo] = useState<TipoMovimiento>("egreso");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoAtajo, setNuevoAtajo] = useState("");
  const [nuevoColor, setNuevoColor] = useState("#3b82f6");

  const [editandoOriginal, setEditandoOriginal] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editAtajo, setEditAtajo] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");

  const [armadoNombre, setArmadoNombre] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (armadoNombre === null) return;
    const timer = setTimeout(() => setArmadoNombre(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoNombre]);

  useEffect(() => {
    if (!abierto) {
      setEditandoOriginal(null);
      setArmadoNombre(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: nuevoTipo,
          nombre: nuevoNombre.trim(),
          atajo: nuevoAtajo.trim(),
          color: nuevoColor,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo crear la categoría.");
        return;
      }
      setNuevoNombre("");
      setNuevoAtajo("");
      onNotificar("success", data.mensaje ?? "Categoría guardada.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al guardar la categoría.");
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoOriginal || !editNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_antiguo: editandoOriginal,
          nombre_nuevo: editNombre.trim(),
          atajo_nuevo: editAtajo.trim(),
          color_nuevo: editColor,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo actualizar.");
        return;
      }
      setEditandoOriginal(null);
      onNotificar("success", data.mensaje ?? "Categoría actualizada.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al actualizar categoría.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (nombre: string) => {
    if (armadoNombre !== nombre) {
      setArmadoNombre(nombre);
      return;
    }
    setArmadoNombre(null);
    setProcesando(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo eliminar.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Categoría eliminada.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al eliminar categoría.");
    } finally {
      setProcesando(false);
    }
  };

  const renderLista = (titulo: string, color: string, lista: CategoriaDTO[]) => (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        padding: "0.75rem",
        borderRadius: "8px",
      }}
    >
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color }}>
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
                onClick={() => {
                  setEditandoOriginal(cat.nombre);
                  setEditNombre(cat.nombre);
                  setEditAtajo(cat.atajo);
                  setEditColor(cat.color || "#3b82f6");
                }}
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
                onClick={() => void handleEliminar(cat.nombre)}
                style={{ padding: "1px 5px", fontSize: "0.7rem" }}
                title="Eliminar"
              >
                {armadoNombre === cat.nombre ? "⚠️ ¿Seguro?" : "🗑️"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "620px" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content-box">
          <div className="panel-header">
            <h3 className="panel-title">
              Gestión de Categorías, Colores y Atajos
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCerrar}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              maxHeight: "280px",
              overflowY: "auto",
              marginBottom: "1rem",
            }}
          >
            {renderLista("Egresos", "var(--expense-color)", categoriasEgreso)}
            {renderLista("Ingresos", "var(--income-color)", categoriasIngreso)}
          </div>

          {editandoOriginal && (
            <form
              onSubmit={handleGuardarEdicion}
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  width: "100%",
                  color: "var(--neutral-color)",
                }}
              >
                Editando categoría: <strong>{editandoOriginal}</strong>
              </span>
              <input
                type="color"
                aria-label="Color de categoría"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                style={{
                  width: "34px",
                  height: "32px",
                  padding: "2px",
                  background: "var(--bg-canvas)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              />
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="input-control"
                placeholder="Nuevo nombre"
                maxLength={60}
                required
                style={{ flex: 2, padding: "6px" }}
              />
              <input
                type="text"
                value={editAtajo}
                onChange={(e) => setEditAtajo(e.target.value)}
                className="input-control"
                placeholder="Atajo"
                maxLength={10}
                style={{ flex: 1, padding: "6px" }}
              />
              <button
                type="submit"
                disabled={procesando}
                className="btn btn-primary btn-sm"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditandoOriginal(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancelar
              </button>
            </form>
          )}

          <form
            onSubmit={handleCrear}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              borderTop: "1px solid var(--border-hairline)",
              paddingTop: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="color"
              aria-label="Color de nueva categoría"
              value={nuevoColor}
              onChange={(e) => setNuevoColor(e.target.value)}
              style={{
                width: "34px",
                height: "32px",
                padding: "2px",
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value as TipoMovimiento)}
              className="input-control"
              style={{ width: "auto", padding: "6px" }}
              required
            >
              <option value="egreso">Egreso</option>
              <option value="ingreso">Ingreso</option>
            </select>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="input-control"
              placeholder="Nueva categoría..."
              required
              maxLength={60}
              style={{ flex: 2, padding: "6px" }}
            />
            <input
              type="text"
              value={nuevoAtajo}
              onChange={(e) => setNuevoAtajo(e.target.value)}
              className="input-control"
              placeholder="Atajo"
              maxLength={10}
              style={{ flex: 1, padding: "6px" }}
            />
            <button
              type="submit"
              disabled={procesando}
              className="btn btn-primary btn-sm"
            >
              + Agregar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
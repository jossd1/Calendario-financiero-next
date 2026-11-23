"use client";

import { useEffect, useMemo, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import CategoriaEdicionForm from "@/components/modales/CategoriaEdicionForm";
import CategoriaListaBox from "@/components/modales/CategoriaListaBox";
import type { CategoriaDTO, TipoMovimiento } from "@/types";

const PALETA_COLORES = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#e11d48",
  "#14b8a6",
  "#a855f7",
  "#eab308",
];

function elegirColorAleatorio(usados: Set<string>): string {
  const libres = PALETA_COLORES.filter((c) => !usados.has(c.toLowerCase()));
  const pool = libres.length > 0 ? libres : PALETA_COLORES;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  const todas = useMemo(
    () => [...categoriasEgreso, ...categoriasIngreso],
    [categoriasEgreso, categoriasIngreso]
  );

  const coloresUsados = useMemo(
    () => new Set(todas.map((c) => (c.color || "").toLowerCase())),
    [todas]
  );

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
    if (abierto) {
      setNuevoColor(elegirColorAleatorio(coloresUsados));
    }
  }, [abierto, coloresUsados]);

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

  const atajoEfectivoNuevo = (
    nuevoAtajo.trim() || nuevoNombre.trim().slice(0, 2)
  ).toLowerCase();
  const atajoDuplicadoNuevo =
    atajoEfectivoNuevo.length > 0
      ? todas.find(
          (c) =>
            c.atajo.trim().toLowerCase() === atajoEfectivoNuevo &&
            c.nombre.toLowerCase() !== nuevoNombre.trim().toLowerCase()
        )?.nombre ?? null
      : null;

  const atajoEfectivoEdit = (
    editAtajo.trim() || editNombre.trim().slice(0, 2)
  ).toLowerCase();
  const atajoDuplicadoEdit =
    editandoOriginal && atajoEfectivoEdit.length > 0
      ? todas.find(
          (c) =>
            c.atajo.trim().toLowerCase() === atajoEfectivoEdit &&
            c.nombre !== editandoOriginal
        )?.nombre ?? null
      : null;

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
      setNuevoColor(elegirColorAleatorio(coloresUsados));
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

  const iniciarEdicion = (cat: CategoriaDTO) => {
    setEditandoOriginal(cat.nombre);
    setEditNombre(cat.nombre);
    setEditAtajo(cat.atajo);
    setEditColor(cat.color || "#3b82f6");
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "640px" }}
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
              maxHeight: "260px",
              overflowY: "auto",
              marginBottom: "1rem",
            }}
          >
            <CategoriaListaBox
              titulo="Egresos"
              colorTitulo="var(--expense-color)"
              lista={categoriasEgreso}
              armadoNombre={armadoNombre}
              onIniciarEdicion={iniciarEdicion}
              onEliminar={handleEliminar}
            />
            <CategoriaListaBox
              titulo="Ingresos"
              colorTitulo="var(--income-color)"
              lista={categoriasIngreso}
              armadoNombre={armadoNombre}
              onIniciarEdicion={iniciarEdicion}
              onEliminar={handleEliminar}
            />
          </div>

          {editandoOriginal && (
            <CategoriaEdicionForm
              nombreOriginal={editandoOriginal}
              nombre={editNombre}
              atajo={editAtajo}
              color={editColor}
              procesando={procesando}
              atajoDuplicado={atajoDuplicadoEdit}
              onCambiarNombre={setEditNombre}
              onCambiarAtajo={setEditAtajo}
              onCambiarColor={setEditColor}
              onCancelar={() => setEditandoOriginal(null)}
              onSubmit={handleGuardarEdicion}
            />
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
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setNuevoColor(elegirColorAleatorio(coloresUsados))}
              title="Color aleatorio"
              style={{ padding: "5px 7px" }}
            >
              🎲
            </button>
            <CustomSelect
              ariaLabel="Tipo de categoría"
              className="compact"
              value={nuevoTipo}
              options={[
                { value: "egreso", label: "Egreso", color: "#ef4444" },
                { value: "ingreso", label: "Ingreso", color: "#10b981" },
              ]}
              onChange={(val) => setNuevoTipo(val as TipoMovimiento)}
            />
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="input-control"
              placeholder="Nueva categoría..."
              required
              maxLength={60}
              style={{ flex: 2, minWidth: "130px", padding: "6px" }}
            />
            <input
              type="text"
              value={nuevoAtajo}
              onChange={(e) => setNuevoAtajo(e.target.value)}
              className="input-control"
              placeholder="Auto (2 letras)"
              maxLength={10}
              style={{ flex: 1, minWidth: "90px", padding: "6px" }}
            />
            <button
              type="submit"
              disabled={procesando}
              className="btn btn-primary btn-sm"
            >
              + Agregar
            </button>

            {atajoDuplicadoNuevo && (
              <span
                style={{
                  width: "100%",
                  fontSize: "0.73rem",
                  color: "var(--range-end-color)",
                }}
              >
                ⚠️ El atajo &quot;{atajoEfectivoNuevo}&quot; ya lo usa &quot;{atajoDuplicadoNuevo}&quot;.
              </span>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

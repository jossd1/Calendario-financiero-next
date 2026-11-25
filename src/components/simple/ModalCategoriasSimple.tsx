"use client";

import { useEffect, useState } from "react";
import type { CategoriaDTO, TipoMovimiento } from "@/types";

const PALETA_SIMPLE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

interface ModalCategoriasSimpleProps {
  abierto: boolean;
  categorias: CategoriaDTO[];
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalCategoriasSimple({
  abierto,
  categorias,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalCategoriasSimpleProps) {
  const [tipo, setTipo] = useState<TipoMovimiento>("egreso");
  const [nombre, setNombre] = useState("");
  const [atajo, setAtajo] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setProcesando(true);
    try {
      const color =
        PALETA_SIMPLE[Math.floor(Math.random() * PALETA_SIMPLE.length)];
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nombre: nombre.trim(),
          atajo: atajo.trim(),
          color,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo guardar.");
        return;
      }
      setNombre("");
      setAtajo("");
      onNotificar("success", data.mensaje ?? "Categoría agregada.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al guardar categoría.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (catNombre: string) => {
    setProcesando(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: catNombre }),
      });
      const data = await res.json();
      if (data.ok) {
        onNotificar("success", `Categoría '${catNombre}' eliminada.`);
        await onActualizado();
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" style={{ maxWidth: "480px" }} role="dialog" aria-modal="true">
        <div className="simple-card" style={{ padding: "20px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <strong style={{ fontSize: "1rem" }}>Categorías y Atajos</strong>
            <button type="button" className="simple-btn" onClick={onCerrar}>✕</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "220px", overflowY: "auto", marginBottom: "14px" }}>
            {categorias.map((c) => (
              <span
                key={c.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#111622",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 8px 5px 10px",
                  fontSize: "0.8rem",
                }}
              >
                <span
                  className="cat-color-dot"
                  style={{ width: "7px", height: "7px", backgroundColor: c.color || "#64748b" }}
                />
                <span>
                  {c.nombre}{" "}
                  <span style={{ color: "#9ca3af" }}>({c.atajo})</span>
                </span>
                <button
                  type="button"
                  disabled={procesando}
                  className="simple-del-btn"
                  style={{ width: "20px", height: "20px", fontSize: "0.82rem" }}
                  onClick={() => void handleEliminar(c.nombre)}
                  title={`Eliminar ${c.nombre}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAgregar} style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
              className="simple-input"
              style={{ width: "auto", padding: "7px 9px", fontSize: "0.82rem" }}
            >
              <option value="egreso">Egreso</option>
              <option value="ingreso">Ingreso</option>
            </select>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre..."
              maxLength={60}
              required
              className="simple-input"
              style={{ flex: 1, minWidth: "120px", padding: "7px 9px", fontSize: "0.82rem" }}
            />
            <input
              type="text"
              value={atajo}
              onChange={(e) => setAtajo(e.target.value)}
              placeholder="Atajo"
              maxLength={10}
              className="simple-input"
              style={{ width: "74px", padding: "7px 9px", fontSize: "0.82rem" }}
            />
            <button type="submit" disabled={procesando} className="simple-btn">
              + Agregar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
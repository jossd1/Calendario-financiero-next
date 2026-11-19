"use client";

import { useState } from "react";
import { formatoSoles, mostrarMonto } from "@/lib/format";
import type { CategoriaDTO, PresupuestoItemDTO } from "@/types";

interface PanelPresupuestosProps {
  presupuestos: PresupuestoItemDTO[];
  categoriasEgreso: CategoriaDTO[];
  fechaRef: string;
  modoPresupuesto: "base_mensual" | "por_mes";
  modoPrivacidad: boolean;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function PanelPresupuestos({
  presupuestos,
  categoriasEgreso,
  fechaRef,
  modoPresupuesto,
  modoPrivacidad,
  onActualizado,
  onNotificar,
}: PanelPresupuestosProps) {
  const [categoria, setCategoria] = useState(
    categoriasEgreso[0]?.nombre ?? ""
  );
  const [limite, setLimite] = useState("");
  const [guardando, setGuardando] = useState(false);

  const mesAnio = modoPresupuesto === "por_mes" ? fechaRef.slice(0, 7) : "BASE";
  const maskClass = modoPrivacidad ? "privacy-dots" : "";

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria || !limite) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          limite_monto: limite,
          mes_anio: mesAnio,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo guardar.");
        return;
      }
      setLimite("");
      onNotificar("success", data.mensaje ?? "Presupuesto guardado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al guardar presupuesto.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      const res = await fetch("/api/presupuestos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        onNotificar("success", data.mensaje ?? "Presupuesto eliminado.");
        await onActualizado();
      }
    } catch {
      onNotificar("error", "Error de red al eliminar presupuesto.");
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">🎯 Presupuestos por Categoría</h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Modo activo:{" "}
            {modoPresupuesto === "por_mes"
              ? `Solo mes ${fechaRef.slice(0, 7)}`
              : "Base mensual recurrente"}
          </span>
        </div>

        <form
          onSubmit={handleGuardar}
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}
        >
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="input-control"
            style={{ width: "auto", minWidth: "150px", padding: "6px 10px" }}
          >
            {categoriasEgreso.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="1"
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            placeholder="Límite S/"
            className="input-control tabular-nums"
            style={{ width: "120px", padding: "6px 10px" }}
            required
          />
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primary btn-sm"
          >
            {guardando ? "..." : "+ Definir"}
          </button>
        </form>
      </div>

      {presupuestos.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "12px",
          }}
        >
          {presupuestos.map((p) => {
            const colorBarra =
              p.porcentaje >= 100
                ? "#ef4444"
                : p.porcentaje >= 80
                ? "#f59e0b"
                : "#10b981";
            const ancho = Math.min(100, p.porcentaje);

            return (
              <div key={p.id} className="general-mini-card" style={{ gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.88rem" }}>
                    <span className="cat-color-dot" style={{ backgroundColor: p.color }} />
                    {p.categoria}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleEliminar(p.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: "1px 6px", fontSize: "0.7rem" }}
                    title="Eliminar presupuesto"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.07)", height: "7px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${ancho}%`, height: "100%", backgroundColor: colorBarra }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                  <span className={`tabular-nums ${maskClass}`}>
                    {mostrarMonto(formatoSoles(p.gastado), modoPrivacidad)} /{" "}
                    {mostrarMonto(formatoSoles(p.limite), modoPrivacidad)}
                  </span>
                  <span className="tabular-nums" style={{ color: colorBarra, fontWeight: 700 }}>
                    {p.porcentaje}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "20px" }}>
          Aún no tienes presupuestos definidos. Agrega un límite arriba para controlar tus gastos.
        </div>
      )}
    </section>
  );
}
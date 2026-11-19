"use client";

import { useEffect, useState } from "react";
import type { TransaccionDTO } from "@/types";

interface ModalPapeleraProps {
  abierto: boolean;
  items: TransaccionDTO[];
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalPapelera({
  abierto,
  items,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalPapeleraProps) {
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [armadoEliminarId, setArmadoEliminarId] = useState<number | null>(null);
  const [armadoVaciar, setArmadoVaciar] = useState(false);
  const [vaciando, setVaciando] = useState(false);

  useEffect(() => {
    if (armadoEliminarId === null) return;
    const timer = setTimeout(() => setArmadoEliminarId(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoEliminarId]);

  useEffect(() => {
    if (!armadoVaciar) return;
    const timer = setTimeout(() => setArmadoVaciar(false), 3500);
    return () => clearTimeout(timer);
  }, [armadoVaciar]);

  useEffect(() => {
    if (!abierto) {
      setArmadoEliminarId(null);
      setArmadoVaciar(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleRestaurar = async (txId: number) => {
    setProcesandoId(txId);
    try {
      const res = await fetch(`/api/transacciones/${txId}/restaurar`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo restaurar.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Movimiento restaurado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al restaurar movimiento.");
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEliminarPermanente = async (txId: number) => {
    if (armadoEliminarId !== txId) {
      setArmadoEliminarId(txId);
      return;
    }
    setArmadoEliminarId(null);
    setProcesandoId(txId);
    try {
      const res = await fetch(`/api/transacciones/${txId}/permanente`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo eliminar.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Eliminado definitivamente.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al eliminar definitivamente.");
    } finally {
      setProcesandoId(null);
    }
  };

  const handleVaciarPapelera = async () => {
    if (!armadoVaciar) {
      setArmadoVaciar(true);
      return;
    }
    setArmadoVaciar(false);
    setVaciando(true);
    try {
      const res = await fetch("/api/transacciones/papelera", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo vaciar la papelera.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Papelera vaciada.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al vaciar papelera.");
    } finally {
      setVaciando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "560px" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content-box">
          <div className="panel-header">
            <h3 className="panel-title" style={{ color: "#f87171" }}>
              Papelera (Revertir o Eliminar Definitivo)
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
              maxHeight: "280px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {items.length > 0 ? (
              items.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong>{p.categoria}</strong> —{" "}
                    <span
                      className={`tabular-nums ${
                        p.tipo === "ingreso" ? "amt-in" : "amt-out"
                      }`}
                    >
                      {p.monto_fmt}
                    </span>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {p.fecha_fmt}
                      {p.descripcion ? ` · ${p.descripcion}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      disabled={procesandoId === p.id}
                      className="btn btn-primary btn-sm"
                      onClick={() => void handleRestaurar(p.id)}
                    >
                      {procesandoId === p.id ? "..." : "♻️ Revertir"}
                    </button>
                    <button
                      type="button"
                      disabled={procesandoId === p.id}
                      className={`btn btn-danger btn-sm ${
                        armadoEliminarId === p.id ? "btn-danger-armed" : ""
                      }`}
                      onClick={() => void handleEliminarPermanente(p.id)}
                      title="Eliminar definitivamente"
                    >
                      {armadoEliminarId === p.id ? "⚠️ ¿Seguro?" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "20px" }}>
                La papelera está vacía.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-hairline)",
              }}
            >
              <button
                type="button"
                disabled={vaciando}
                className={`btn btn-sm ${
                  armadoVaciar ? "btn-danger-armed" : "btn-danger"
                }`}
                onClick={() => void handleVaciarPapelera()}
              >
                {vaciando
                  ? "Vaciando..."
                  : armadoVaciar
                  ? "⚠️ ¿Vaciar todo definitivamente?"
                  : "🧹 Vaciar Papelera"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
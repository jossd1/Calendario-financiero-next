"use client";

import { useEffect, useState } from "react";
import AppIcon from "@/components/AppIcon";
import { mostrarMontoMoneda } from "@/lib/monedas";
import type { TransaccionDTO } from "@/types";

interface ModalPapeleraProps {
  abierto: boolean;
  items: TransaccionDTO[];
  moneda: string;
  modoPrivacidad: boolean;
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalPapelera({
  abierto,
  items,
  moneda,
  modoPrivacidad,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalPapeleraProps) {
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [armadoVaciar, setArmadoVaciar] = useState(false);
  const [vaciando, setVaciando] = useState(false);
  const [armadoRevertirTodo, setArmadoRevertirTodo] = useState(false);
  const [revirtiendoTodo, setRevirtiendoTodo] = useState(false);

  useEffect(() => {
    if (!armadoVaciar) return;
    const timer = setTimeout(() => setArmadoVaciar(false), 3500);
    return () => clearTimeout(timer);
  }, [armadoVaciar]);

  useEffect(() => {
    if (!armadoRevertirTodo) return;
    const timer = setTimeout(() => setArmadoRevertirTodo(false), 3500);
    return () => clearTimeout(timer);
  }, [armadoRevertirTodo]);

  useEffect(() => {
    if (!abierto) {
      setArmadoVaciar(false);
      setArmadoRevertirTodo(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleRestaurar = async (tx: TransaccionDTO) => {
    setProcesandoId(tx.id);
    try {
      const res = await fetch(`/api/transacciones/${tx.id}/restaurar`, {
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

  const handleRevertirTodo = async () => {
    if (!armadoRevertirTodo) {
      setArmadoRevertirTodo(true);
      return;
    }
    setArmadoRevertirTodo(false);
    setRevirtiendoTodo(true);
    try {
      const res = await fetch("/api/transacciones/papelera", {
        method: "POST",
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo revertir todo.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Movimientos restaurados.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al revertir la papelera.");
    } finally {
      setRevirtiendoTodo(false);
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
            <h3
              className="panel-title"
              style={{
                color: "var(--text-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AppIcon name="papelera" size={17} />
              <span>Papelera</span>
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
              maxHeight: "290px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
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
                    background: "rgba(6, 9, 17, 0.72)",
                    border: "1px solid var(--border-hairline)",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>
                      {p.descripcion || p.categoria}
                    </div>
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {p.fecha_fmt} · {p.categoria}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span
                      className={`tabular-nums ${
                        p.tipo === "ingreso" ? "amt-in" : "amt-out"
                      } ${modoPrivacidad ? "privacy-dots" : ""}`}
                      style={{ fontWeight: 600 }}
                    >
                      {mostrarMontoMoneda(
                        p.monto_fmt,
                        modoPrivacidad,
                        moneda,
                        p.tipo === "ingreso" ? "+" : "-"
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={procesandoId === p.id}
                      className="btn btn-secondary btn-sm"
                      style={{
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                        borderColor: "rgba(56, 189, 248, 0.28)",
                        color: "var(--neutral-color)",
                      }}
                      onClick={() => void handleRestaurar(p)}
                    >
                      <AppIcon name="revertir" size={14} />
                      <span>{procesandoId === p.id ? "..." : "Revertir"}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "24px" }}>
                La papelera está vacía.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-hairline)",
              }}
            >
              <button
                type="button"
                disabled={revirtiendoTodo || vaciando}
                className={`btn btn-sm ${
                  armadoRevertirTodo ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => void handleRevertirTodo()}
              >
                {revirtiendoTodo
                  ? "Revirtiendo..."
                  : armadoRevertirTodo
                  ? "⚠️ ¿Confirmar revertir todo?"
                  : "♻️ Revertir Todo"}
              </button>

              <button
                type="button"
                disabled={vaciando || revirtiendoTodo}
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

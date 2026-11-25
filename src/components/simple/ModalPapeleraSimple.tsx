"use client";

import { useEffect, useState } from "react";
import { mostrarMontoMoneda } from "@/lib/monedas";
import type { TransaccionDTO } from "@/types";

interface ModalPapeleraSimpleProps {
  abierto: boolean;
  items: TransaccionDTO[];
  moneda: string;
  modoPrivacidad: boolean;
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalPapeleraSimple({
  abierto,
  items,
  moneda,
  modoPrivacidad,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalPapeleraSimpleProps) {
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

  const restaurarUno = async (id: number) => {
    setProcesando(true);
    try {
      const res = await fetch(`/api/transacciones/${id}/restaurar`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        onNotificar("success", "Movimiento restaurado.");
        await onActualizado();
      }
    } finally {
      setProcesando(false);
    }
  };

  const revertirTodo = async () => {
    setProcesando(true);
    try {
      const res = await fetch("/api/transacciones/papelera", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        onNotificar("success", data.mensaje ?? "Movimientos restaurados.");
        await onActualizado();
      }
    } finally {
      setProcesando(false);
    }
  };

  const vaciar = async () => {
    setProcesando(true);
    try {
      const res = await fetch("/api/transacciones/papelera", { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        onNotificar("success", "Papelera vaciada.");
        await onActualizado();
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" style={{ maxWidth: "460px" }} role="dialog" aria-modal="true">
        <div className="simple-card" style={{ padding: "20px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <strong style={{ fontSize: "1rem" }}>Papelera</strong>
            <button type="button" className="simple-btn" onClick={onCerrar}>✕</button>
          </div>

          <div className="simple-mov-list" style={{ marginTop: 0, maxHeight: "240px" }}>
            {items.length > 0 ? (
              items.map((p) => (
                <div key={p.id} className="simple-mov-item">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{p.categoria}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      {p.fecha_fmt} · {mostrarMontoMoneda(p.monto_fmt, modoPrivacidad, moneda)}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={procesando}
                    className="simple-btn"
                    onClick={() => void restaurarUno(p.id)}
                  >
                    Restaurar
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#6b7280", padding: "20px 0", fontSize: "0.84rem" }}>
                La papelera está vacía.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button type="button" disabled={procesando} className="simple-btn" onClick={() => void revertirTodo()}>
                Revertir todo
              </button>
              <button type="button" disabled={procesando} className="simple-btn" style={{ color: "#f87171" }} onClick={() => void vaciar()}>
                Vaciar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
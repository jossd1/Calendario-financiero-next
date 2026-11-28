"use client";

import { useEffect, useState } from "react";
import ProgramadosCreateForm from "@/components/modales/ProgramadosCreateForm";
import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
import type { CategoriaDTO, TransaccionDTO } from "@/types";

interface ModalProgramadosProps {
  abierto: boolean;
  items: TransaccionDTO[];
  moneda: string;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  hoyIso: string;
  limitarAnios: boolean;
  sumarEnKpi: boolean;
  modoPrivacidad: boolean;
  onCerrar: () => void;
  onToggleSumarEnKpi: (val: boolean) => Promise<void>;
  onActualizado: () => Promise<void>;
  onEditarTx: (tx: TransaccionDTO) => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalProgramados({
  abierto,
  items,
  moneda,
  categoriasEgreso,
  categoriasIngreso,
  hoyIso,
  limitarAnios,
  sumarEnKpi,
  modoPrivacidad,
  onCerrar,
  onToggleSumarEnKpi,
  onActualizado,
  onEditarTx,
  onNotificar,
}: ModalProgramadosProps) {
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const maskClass = modoPrivacidad ? "privacy-dots" : "";

  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const totalPendiente = items.reduce(
    (acc, tx) => (tx.tipo === "egreso" ? acc - tx.monto : acc + tx.monto),
    0
  );

  const handleMarcarPagado = async (tx: TransaccionDTO) => {
    setConfirmandoId(tx.id);
    try {
      const res = await fetch(`/api/transacciones/${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tx.tipo,
          monto: tx.monto,
          categoria: tx.categoria,
          descripcion: tx.descripcion,
          fecha: tx.fecha_iso,
          subperfil_id: tx.subperfil_id,
          estado: "pagado",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo confirmar.");
        return;
      }
      onNotificar("success", "Movimiento confirmado como Pagado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al confirmar pago.");
    } finally {
      setConfirmandoId(null);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "700px" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content-box">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">⏳ Pagos Pendientes y Programados</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                {sumarEnKpi
                  ? "Sumados actualmente en tus KPIs"
                  : "Proyección aparte (no alteran tu saldo real hasta confirmarlos)"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="period-badge-inline"
                style={{ fontSize: "0.82rem", padding: "3px 10px" }}
              >
                {items.length} pend. ·{" "}
                <span className={maskClass}>
                  {mostrarMontoMoneda(
                    formatoMoneda(totalPendiente, moneda),
                    modoPrivacidad,
                    moneda
                  )}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onCerrar}
              >
                ✕
              </button>
            </div>
          </div>

          <ProgramadosCreateForm
            moneda={moneda}
            categoriasEgreso={categoriasEgreso}
            categoriasIngreso={categoriasIngreso}
            hoyIso={hoyIso}
            limitarAnios={limitarAnios}
            onCreado={onActualizado}
            onNotificar={onNotificar}
          />

          <div
            className="settings-row clickable"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "10px",
              padding: "8px 12px",
              marginBottom: "10px",
            }}
            onClick={() => void onToggleSumarEnKpi(!sumarEnKpi)}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Incluir pendientes y programados en el cálculo de KPIs
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sumarEnKpi}
              className={`settings-switch ${sumarEnKpi ? "on" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                void onToggleSumarEnKpi(!sumarEnKpi);
              }}
            >
              <span className="settings-switch-thumb" />
            </button>
          </div>

          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {items.length > 0 ? (
              items.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-hairline)",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>{tx.categoria}</strong>
                      <span
                        className="settings-badge proximo"
                        style={{ textTransform: "capitalize" }}
                      >
                        {tx.estado}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {tx.fecha_fmt}
                      {tx.descripcion ? ` · ${tx.descripcion}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      className={`tabular-nums ${
                        tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                      } ${maskClass}`}
                      style={{ fontWeight: 700, fontSize: "0.9rem" }}
                    >
                      {mostrarMontoMoneda(
                        tx.monto_fmt,
                        modoPrivacidad,
                        moneda,
                        tx.tipo === "ingreso" ? "+" : "-"
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={confirmandoId === tx.id}
                      onClick={() => void handleMarcarPagado(tx)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: "3px 9px", fontSize: "0.76rem" }}
                    >
                      {confirmandoId === tx.id ? "..." : "✓ Pagado"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCerrar();
                        onEditarTx(tx);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "3px 8px", fontSize: "0.76rem" }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "20px" }}>
                No tienes pagos pendientes o programados.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState } from "react";
import { mostrarMonto } from "@/lib/format";
import type { TransaccionDTO } from "@/types";

interface PanelProgramadosProps {
  items: TransaccionDTO[];
  sumarEnKpi: boolean;
  modoPrivacidad: boolean;
  onActualizado: () => Promise<void>;
  onEditarTx: (tx: TransaccionDTO) => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function PanelProgramados({
  items,
  sumarEnKpi,
  modoPrivacidad,
  onActualizado,
  onEditarTx,
  onNotificar,
}: PanelProgramadosProps) {
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const maskClass = modoPrivacidad ? "privacy-dots" : "";

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
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">⏳ Pagos Pendientes y Programados</h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            {sumarEnKpi
              ? "Sumados actualmente en tus KPIs"
              : "Proyección aparte (no alteran tu saldo real hasta confirmarlos)"}
          </span>
        </div>
        <span className="period-badge-inline">
          {items.length} pendiente(s) · Neto proy.:{" "}
          <span className={maskClass}>
            {mostrarMonto(
              `${totalPendiente < 0 ? "-" : ""}S/ ${Math.abs(totalPendiente).toFixed(2)}`,
              modoPrivacidad
            )}
          </span>
        </span>
      </div>

      {items.length > 0 ? (
        <div className="table-scroll">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th className="num">Monto (S/)</th>
                <th className="num">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <tr key={tx.id}>
                  <td className="tabular-nums">{tx.fecha_fmt}</td>
                  <td>
                    <span
                      className="settings-badge proximo"
                      style={{ textTransform: "capitalize" }}
                    >
                      {tx.estado}
                    </span>
                  </td>
                  <td>{tx.categoria}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {tx.descripcion || "—"}
                  </td>
                  <td
                    className={`num tabular-nums ${
                      tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                    } ${maskClass}`}
                    style={{ fontWeight: 600 }}
                  >
                    {mostrarMonto(
                      tx.monto_fmt,
                      modoPrivacidad,
                      tx.tipo === "ingreso" ? "+" : "-"
                    )}
                  </td>
                  <td className="num">
                    <div className="row-actions">
                      <button
                        type="button"
                        disabled={confirmandoId === tx.id}
                        onClick={() => void handleMarcarPagado(tx)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                      >
                        {confirmandoId === tx.id ? "..." : "✓ Pagado"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditarTx(tx)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "3px 7px", fontSize: "0.74rem" }}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "20px" }}>
          No tienes pagos pendientes o programados.
        </div>
      )}
    </section>
  );
}
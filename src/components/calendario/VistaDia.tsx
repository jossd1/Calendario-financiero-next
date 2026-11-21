"use client";

import { useEffect, useState } from "react";
import AppIcon from "@/components/AppIcon";
import { mostrarMonto } from "@/lib/format";
import type { TransaccionDTO } from "@/types";

interface VistaDiaProps {
  transaccionesDia: TransaccionDTO[];
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function VistaDia({
  transaccionesDia,
  colorPorCategoria,
  modoPrivacidad,
  onEditarTx,
  onEliminarTx,
}: VistaDiaProps) {
  const [busquedaDia, setBusquedaDia] = useState("");
  const [armadoTxId, setArmadoTxId] = useState<number | null>(null);

  useEffect(() => {
    if (armadoTxId === null) return;
    const timer = setTimeout(() => setArmadoTxId(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoTxId]);

  const filtradas = transaccionesDia.filter((tx) => {
    if (!busquedaDia.trim()) return true;
    const q = busquedaDia.trim().toLowerCase();
    return (
      tx.categoria.toLowerCase().includes(q) ||
      tx.descripcion.toLowerCase().includes(q) ||
      tx.tipo.toLowerCase().includes(q)
    );
  });

  const handleDobleClickEliminar = async (txId: number) => {
    if (armadoTxId !== txId) {
      setArmadoTxId(txId);
      return;
    }
    setArmadoTxId(null);
    await onEliminarTx(txId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.2)",
          padding: "10px",
          borderRadius: "8px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          Total registros en este día: {filtradas.length}
        </span>
        <input
          type="text"
          value={busquedaDia}
          onChange={(e) => setBusquedaDia(e.target.value)}
          placeholder="Filtrar por categoría..."
          className="input-control"
          style={{ maxWidth: "220px", padding: "4px 8px", fontSize: "0.8rem" }}
        />
      </div>

      <div className="table-scroll">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th className="num">Monto (S/)</th>
              <th className="num">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length > 0 ? (
              filtradas.map((tx) => (
                <tr key={tx.id}>
                  <td
                    className="tabular-nums"
                    style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                  >
                    {tx.hora_fmt || "—"}
                  </td>
                  <td>
                    <span
                      className={tx.tipo === "ingreso" ? "amt-in" : "amt-out"}
                      style={{ fontWeight: 600 }}
                    >
                      {tx.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <span
                        className="cat-color-dot"
                        style={{
                          backgroundColor:
                            colorPorCategoria.get(tx.categoria) ?? "#3b82f6",
                        }}
                      />
                      {tx.categoria}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {tx.descripcion || "—"}
                  </td>
                  <td
                    className={`num tabular-nums ${
                      tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                    } ${modoPrivacidad ? "privacy-dots" : ""}`}
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
                        onClick={() => onEditarTx(tx)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDobleClickEliminar(tx.id)}
                        className={`btn btn-danger btn-sm ${
                          armadoTxId === tx.id ? "btn-danger-armed" : ""
                        }`}
                        style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                        title="Eliminar"
                      >
                        {armadoTxId === tx.id ? (
                          "⚠️ ¿Seguro?"
                        ) : (
                          <AppIcon name="eliminar" size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    No hay movimientos registrados en este día.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
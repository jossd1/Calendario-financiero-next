"use client";

import { useMemo } from "react";
import { mostrarMonto } from "@/lib/format";
import type { CategoriaDTO, TransaccionDTO } from "@/types";

interface MovimientosRecientesProps {
  transacciones: TransaccionDTO[];
  categorias: CategoriaDTO[];
  modoPrivacidad: boolean;
  onEditarTx: (tx: TransaccionDTO) => void;
}

export default function MovimientosRecientes({
  transacciones,
  categorias,
  modoPrivacidad,
  onEditarTx,
}: MovimientosRecientesProps) {
  const recientes = transacciones.slice(0, 4);

  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of categorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [categorias]);

  return (
    <aside className="panel" style={{ padding: "16px 18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h4 className="panel-title" style={{ fontSize: "0.92rem" }}>
          Movimientos Recientes
        </h4>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
          {recientes.length} reg.
        </span>
      </div>

      {recientes.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {recientes.map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => onEditarTx(tx)}
              className="recent-mini-row"
              title="Clic para editar"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: 0,
                }}
              >
                <span
                  className="cat-color-dot"
                  style={{
                    width: "7px",
                    height: "7px",
                    backgroundColor:
                      colorPorCategoria.get(tx.categoria) ?? "#3b82f6",
                  }}
                />
                <span className="recent-mini-label">
                  {tx.descripcion || tx.categoria}
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <span
                  className="tabular-nums"
                  style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                >
                  {tx.fecha_fmt.slice(0, 5)}
                </span>
                <span
                  className={`tabular-nums ${
                    tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                  } ${modoPrivacidad ? "privacy-dots" : ""}`}
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  {mostrarMonto(
                    tx.monto_fmt,
                    modoPrivacidad,
                    tx.tipo === "ingreso" ? "+" : "-"
                  )}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "10px 0",
          }}
        >
          Sin movimientos recientes en este periodo.
        </div>
      )}
    </aside>
  );
}
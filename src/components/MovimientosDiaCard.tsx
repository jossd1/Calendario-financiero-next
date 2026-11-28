"use client";

import { useMemo } from "react";
import AppIcon from "@/components/AppIcon";
import { formatearFechaDMY } from "@/lib/format";
import { mostrarMontoMoneda } from "@/lib/monedas";
import type { CategoriaDTO, TransaccionDTO } from "@/types";

interface MovimientosDiaCardProps {
  fechaDia: string;
  movimientosPeriodo: TransaccionDTO[];
  categorias: CategoriaDTO[];
  moneda: string;
  modoPrivacidad: boolean;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function MovimientosDiaCard({
  fechaDia,
  movimientosPeriodo,
  categorias,
  moneda,
  modoPrivacidad,
  onEditarTx,
  onEliminarTx,
}: MovimientosDiaCardProps) {
  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of categorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [categorias]);

  const delDia = useMemo(
    () => movimientosPeriodo.filter((t) => t.fecha_iso === fechaDia),
    [movimientosPeriodo, fechaDia]
  );

  return (
    <aside className="panel day-movements-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          gap: "8px",
        }}
      >
        <h4 className="panel-title" style={{ fontSize: "0.92rem" }}>
          Movimientos del {formatearFechaDMY(fechaDia)}
        </h4>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
          {delDia.length} reg.
        </span>
      </div>

      {delDia.length > 0 ? (
        <div className="day-movements-scroll">
          {delDia.map((tx) => (
            <div key={tx.id} className="day-movement-row">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: 0,
                  flex: 1,
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
                <div style={{ minWidth: 0 }}>
                  <div className="recent-mini-label">
                    {tx.descripcion || tx.categoria}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {tx.categoria}
                    {tx.subperfil_nombre ? ` · ${tx.subperfil_nombre}` : ""}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <span
                  className={`tabular-nums ${
                    tx.tipo === "ingreso" ? "amt-in" : "amt-out"
                  } ${modoPrivacidad ? "privacy-dots" : ""}`}
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
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
                  onClick={() => onEditarTx(tx)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => void onEliminarTx(tx.id)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                  title="Enviar a papelera"
                >
                  <AppIcon name="papelera" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          No hay movimientos registrados el {formatearFechaDMY(fechaDia)}.
        </div>
      )}
    </aside>
  );
}

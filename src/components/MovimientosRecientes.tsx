"use client";

import { useMemo } from "react";
import AppIcon from "@/components/AppIcon";
import { mostrarMontoMoneda } from "@/lib/monedas";
import type {
  AccionActividad,
  ActividadRecienteItem,
  CategoriaDTO,
  TransaccionDTO,
} from "@/types";

interface MovimientosRecientesProps {
  actividades: ActividadRecienteItem[];
  categorias: CategoriaDTO[];
  moneda: string;
  maxItems: number;
  modoPrivacidad: boolean;
  onEditarTx: (tx: TransaccionDTO) => void;
  onAbrirPapelera: () => void;
}

const CLASE_ACCION: Record<AccionActividad, string> = {
  Agregado: "act-agregado",
  Editado: "act-editado",
  Eliminado: "act-eliminado",
  Restaurado: "act-restaurado",
  Pagado: "act-pagado",
  Registrado: "act-registrado",
};

function renderIconoAccion(accion: AccionActividad) {
  switch (accion) {
    case "Agregado":
      return <span aria-hidden="true">➕</span>;
    case "Editado":
      return <span aria-hidden="true">✏️</span>;
    case "Eliminado":
      return <AppIcon name="papelera" size={12} />;
    case "Restaurado":
      return <span aria-hidden="true">♻️</span>;
    case "Pagado":
      return <span aria-hidden="true">✓</span>;
    default:
      return <span aria-hidden="true">📝</span>;
  }
}

export default function MovimientosRecientes({
  actividades,
  categorias,
  moneda,
  maxItems,
  modoPrivacidad,
  onEditarTx,
  onAbrirPapelera,
}: MovimientosRecientesProps) {
  const visibles = actividades.slice(0, maxItems);

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
          {visibles.length} reg.
        </span>
      </div>

      {visibles.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {visibles.map((item) => {
            const { tx, accion } = item;
            const esEliminado = accion === "Eliminado";

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  esEliminado ? onAbrirPapelera() : onEditarTx(tx)
                }
                className="recent-mini-row"
                title={
                  esEliminado
                    ? "Clic para abrir Papelera"
                    : "Clic para editar movimiento"
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: 0,
                  }}
                >
                  <span className={`recent-action-ref ${CLASE_ACCION[accion]}`}>
                    {renderIconoAccion(accion)}
                    <span>{accion}</span>
                  </span>
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
                    {mostrarMontoMoneda(
                      tx.monto_fmt,
                      modoPrivacidad,
                      moneda,
                      tx.tipo === "ingreso" ? "+" : "-"
                    )}
                  </span>
                </div>
              </button>
            );
          })}
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
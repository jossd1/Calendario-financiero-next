"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoriaDTO, TipoMovimiento, TransaccionDTO } from "@/types";

interface ModalEditarTxProps {
  tx: TransaccionDTO | null;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  programadosActivos: boolean;
  onCerrar: () => void;
  onGuardado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalEditarTx({
  tx,
  categoriasEgreso,
  categoriasIngreso,
  programadosActivos,
  onCerrar,
  onGuardado,
  onNotificar,
}: ModalEditarTxProps) {
  const [tipo, setTipo] = useState<TipoMovimiento>("egreso");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"pagado" | "pendiente" | "programado">("pagado");
  const [guardando, setGuardando] = useState(false);

  const todasCategorias = useMemo(
    () => [...categoriasEgreso, ...categoriasIngreso],
    [categoriasEgreso, categoriasIngreso]
  );

  useEffect(() => {
    if (!tx) return;
    setTipo(tx.tipo);
    setMonto(tx.monto.toFixed(2));
    setCategoria(tx.categoria);
    setFecha(tx.fecha_iso);
    setDescripcion(tx.descripcion);
    setEstado(tx.estado ?? "pagado");
  }, [tx]);

  useEffect(() => {
    if (!tx) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tx, onCerrar]);

  if (!tx) return null;

  const categoriaEnLista = todasCategorias.some((c) => c.nombre === categoria);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await fetch(`/api/transacciones/${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          monto,
          categoria,
          fecha,
          descripcion,
          estado: programadosActivos ? estado : tx.estado,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo actualizar.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Transacción actualizada.");
      await onGuardado();
      onCerrar();
    } catch {
      onNotificar("error", "Error de red al actualizar la transacción.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloModalEditarTx"
      >
        <div className="modal-content-box">
          <div className="panel-header">
            <div>
              <h3 id="tituloModalEditarTx" className="panel-title">
                Editar Transacción #{tx.id}
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                Modifica los detalles del movimiento en Soles peruanos (S/).
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCerrar}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-field">
              <label>Tipo de Operación</label>
              <div className="type-toggle">
                <label className="type-radio">
                  <input
                    type="radio"
                    name="edit_tipo"
                    value="ingreso"
                    checked={tipo === "ingreso"}
                    onChange={() => setTipo("ingreso")}
                  />
                  <span>Ingreso (+)</span>
                </label>
                <label className="type-radio">
                  <input
                    type="radio"
                    name="edit_tipo"
                    value="egreso"
                    checked={tipo === "egreso"}
                    onChange={() => setTipo("egreso")}
                  />
                  <span>Egreso (-)</span>
                </label>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="edit-monto">Monto en Soles (S/)</label>
              <input
                id="edit-monto"
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="input-control tabular-nums"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-categoria">Categoría</label>
              <select
                id="edit-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-control"
                required
              >
                {!categoriaEnLista && categoria && (
                  <option value={categoria}>{categoria}</option>
                )}
                <optgroup label="Egresos">
                  {categoriasEgreso.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Ingresos">
                  {categoriasIngreso.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="edit-fecha">Fecha del Movimiento</label>
              <input
                id="edit-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-control tabular-nums"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-descripcion">Descripción</label>
              <input
                id="edit-descripcion"
                type="text"
                maxLength={240}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalle..."
                className="input-control"
              />
            </div>

            {programadosActivos && (
              <div className="form-field">
                <label htmlFor="edit-estado">Estado</label>
                <select
                  id="edit-estado"
                  value={estado}
                  onChange={(e) =>
                    setEstado(
                      e.target.value as "pagado" | "pendiente" | "programado"
                    )
                  }
                  className="input-control"
                >
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="programado">Programado</option>
                </select>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "6px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCerrar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="btn btn-primary"
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
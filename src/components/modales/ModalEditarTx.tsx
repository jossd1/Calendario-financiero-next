"use client";

import { useEffect, useMemo, useState } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import { formatearFechaDMY } from "@/lib/format";
import { formatoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type {
  CategoriaDTO,
  SubperfilDTO,
  TipoMovimiento,
  TransaccionDTO,
} from "@/types";

interface ModalEditarTxProps {
  tx: TransaccionDTO | null;
  moneda: string;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  subperfiles: SubperfilDTO[];
  programadosActivos: boolean;
  onCerrar: () => void;
  onGuardado: (txActualizada: TransaccionDTO) => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalEditarTx({
  tx,
  moneda,
  categoriasEgreso,
  categoriasIngreso,
  subperfiles,
  programadosActivos,
  onCerrar,
  onGuardado,
  onNotificar,
}: ModalEditarTxProps) {
  const [tipo, setTipo] = useState<TipoMovimiento>("egreso");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subperfilId, setSubperfilId] = useState<string>("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"pagado" | "pendiente" | "programado">("pagado");
  const [guardando, setGuardando] = useState(false);

  const { codigo, simbolo } = obtenerMonedaInfo(moneda);

  const todasCategorias = useMemo(
    () => [...categoriasEgreso, ...categoriasIngreso],
    [categoriasEgreso, categoriasIngreso]
  );

  useEffect(() => {
    if (!tx) return;
    setTipo(tx.tipo);
    setMonto(tx.monto.toFixed(2));
    setCategoria(tx.categoria);
    setSubperfilId(tx.subperfil_id ? String(tx.subperfil_id) : "");
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
  const opcionesCategorias: CustomSelectOption[] = [
    ...(!categoriaEnLista && categoria
      ? [{ value: categoria, label: categoria, color: "#64748b" }]
      : []),
    ...categoriasEgreso.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#3b82f6",
      grupo: "Egresos",
    })),
    ...categoriasIngreso.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#10b981",
      grupo: "Ingresos",
    })),
  ];

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
          subperfil_id: subperfilId ? Number(subperfilId) : null,
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
      const montoNum = Number(String(monto).replace(",", "."));
      onNotificar("success", data.mensaje ?? "Transacción actualizada.");
      await onGuardado({
        ...tx,
        tipo,
        monto: montoNum,
        monto_fmt: formatoMoneda(montoNum, moneda),
        categoria,
        descripcion,
        fecha_iso: fecha,
        fecha_fmt: formatearFechaDMY(fecha),
        estado: programadosActivos ? estado : tx.estado,
      });
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
                Modifica los detalles del movimiento en {codigo} ({simbolo}).
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
            <div className="type-toggle-unified">
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

            <div className="form-row-2col">
              <div className="form-field">
                <label htmlFor="edit-monto">Monto ({simbolo})</label>
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
                <label htmlFor="edit-fecha">Fecha</label>
                <input
                  id="edit-fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="input-control tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="edit-categoria">Categoría</label>
              <CustomSelect
                id="edit-categoria"
                ariaLabel="Categoría"
                value={categoria}
                options={opcionesCategorias}
                onChange={setCategoria}
              />
            </div>

            {subperfiles.length > 0 && (
              <div className="form-field">
                <label htmlFor="edit-subperfil">Subperfil / Entorno</label>
                <CustomSelect
                  id="edit-subperfil"
                  ariaLabel="Subperfil"
                  value={subperfilId}
                  options={[
                    { value: "", label: "Sin asignar (General)" },
                    ...subperfiles.map((s) => ({
                      value: String(s.id),
                      label: `${s.icono} ${s.nombre}`,
                      hint: `[${s.atajo}]`,
                    })),
                  ]}
                  onChange={setSubperfilId}
                />
              </div>
            )}

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
                <CustomSelect
                  id="edit-estado"
                  ariaLabel="Estado"
                  value={estado}
                  options={[
                    { value: "pagado", label: "Pagado" },
                    { value: "pendiente", label: "Pendiente" },
                    { value: "programado", label: "Programado" },
                  ]}
                  onChange={(val) =>
                    setEstado(val as "pagado" | "pendiente" | "programado")
                  }
                />
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
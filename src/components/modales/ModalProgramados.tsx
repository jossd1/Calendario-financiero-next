"use client";

import { useEffect, useState } from "react";
import { mostrarMonto } from "@/lib/format";
import type {
  CategoriaDTO,
  TipoMovimiento,
  TransaccionDTO,
} from "@/types";

interface ModalProgramadosProps {
  abierto: boolean;
  items: TransaccionDTO[];
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  hoyIso: string;
  limitarAnios: boolean;
  sumarEnKpi: boolean;
  modoPrivacidad: boolean;
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onEditarTx: (tx: TransaccionDTO) => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalProgramados({
  abierto,
  items,
  categoriasEgreso,
  categoriasIngreso,
  hoyIso,
  limitarAnios,
  sumarEnKpi,
  modoPrivacidad,
  onCerrar,
  onActualizado,
  onEditarTx,
  onNotificar,
}: ModalProgramadosProps) {
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoMovimiento>("egreso");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(
    categoriasEgreso[0]?.nombre ?? categoriasIngreso[0]?.nombre ?? ""
  );
  const [fecha, setFecha] = useState(hoyIso);
  const [descripcion, setDescripcion] = useState("");
  const [estadoNuevo, setEstadoNuevo] = useState<"pendiente" | "programado">(
    "pendiente"
  );
  const [guardando, setGuardando] = useState(false);

  const maskClass = modoPrivacidad ? "privacy-dots" : "";

  useEffect(() => {
    if (!abierto) return;
    setFecha(hoyIso);
    const lista = tipo === "ingreso" ? categoriasIngreso : categoriasEgreso;
    if (lista.length > 0 && !lista.some((c) => c.nombre === categoria)) {
      setCategoria(lista[0].nombre);
    }
  }, [abierto, hoyIso, tipo, categoriasEgreso, categoriasIngreso, categoria]);

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

  const handleCambioTipo = (nuevoTipo: TipoMovimiento) => {
    setTipo(nuevoTipo);
    const lista =
      nuevoTipo === "ingreso" ? categoriasIngreso : categoriasEgreso;
    if (lista.length > 0) setCategoria(lista[0].nombre);
  };

  const handleCrearProgramado = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(monto.replace(",", "."));
    if (!Number.isFinite(montoNum) || montoNum <= 0 || !categoria || !fecha) {
      onNotificar("error", "Completa monto, categoría y fecha válidos.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          monto: montoNum.toFixed(2),
          categoria,
          descripcion,
          fecha,
          estado: estadoNuevo,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo guardar.");
        return;
      }
      setMonto("");
      setDescripcion("");
      onNotificar(
        "success",
        `${estadoNuevo === "programado" ? "Programado" : "Pendiente"} registrado.`
      );
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al guardar pendiente/programado.");
    } finally {
      setGuardando(false);
    }
  };

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

  const listaCatsActiva =
    tipo === "ingreso" ? categoriasIngreso : categoriasEgreso;

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
                  {mostrarMonto(
                    `${totalPendiente < 0 ? "-" : ""}S/ ${Math.abs(totalPendiente).toFixed(2)}`,
                    modoPrivacidad
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

          <form
            onSubmit={handleCrearProgramado}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "8px",
              }}
            >
              <select
                aria-label="Tipo"
                value={tipo}
                onChange={(e) => handleCambioTipo(e.target.value as TipoMovimiento)}
                className="input-control"
                style={{ padding: "6px 8px", fontSize: "0.82rem" }}
              >
                <option value="egreso">Egreso (-)</option>
                <option value="ingreso">Ingreso (+)</option>
              </select>

              <input
                type="text"
                inputMode="decimal"
                placeholder="Monto S/"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="input-control tabular-nums"
                style={{ padding: "6px 8px", fontSize: "0.82rem" }}
                required
              />

              <select
                aria-label="Categoría"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-control"
                style={{ padding: "6px 8px", fontSize: "0.82rem" }}
                required
              >
                {listaCatsActiva.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                aria-label="Estado"
                value={estadoNuevo}
                onChange={(e) =>
                  setEstadoNuevo(e.target.value as "pendiente" | "programado")
                }
                className="input-control"
                style={{ padding: "6px 8px", fontSize: "0.82rem" }}
              >
                <option value="pendiente">Pendiente</option>
                <option value="programado">Programado</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                type="date"
                min={limitarAnios ? "2000-01-01" : undefined}
                max={limitarAnios ? "3000-12-31" : undefined}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-control tabular-nums"
                style={{ width: "155px", padding: "6px 8px", fontSize: "0.82rem" }}
                required
              />
              <input
                type="text"
                maxLength={240}
                placeholder="Descripción (ej. Recibo de luz)..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-control"
                style={{ flex: 1, minWidth: "160px", padding: "6px 8px", fontSize: "0.82rem" }}
              />
              <button
                type="submit"
                disabled={guardando}
                className="btn btn-primary btn-sm"
              >
                {guardando ? "..." : "+ Agregar"}
              </button>
            </div>
          </form>

          <div
            style={{
              maxHeight: "260px",
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
                      {mostrarMonto(
                        tx.monto_fmt,
                        modoPrivacidad,
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
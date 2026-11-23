"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppIcon from "@/components/AppIcon";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import EditableText from "@/components/EditableText";
import { mostrarMontoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { CategoriaDTO, TextosUI, TransaccionDTO } from "@/types";

interface TablaTransaccionesProps {
  initialItems: TransaccionDTO[];
  initialHasMore: boolean;
  inicioPeriodo: string;
  finPeriodo: string;
  tituloPeriodo: string;
  moneda: string;
  todasCategorias: CategoriaDTO[];
  filtroCategoria: string;
  filtroTipo: "todos" | "ingreso" | "egreso";
  filtroBusqueda: string;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarFiltros: (filtros: {
    categoria: string;
    tipo: "todos" | "ingreso" | "egreso";
    busqueda: string;
  }) => Promise<void>;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function TablaTransacciones({
  initialItems,
  initialHasMore,
  inicioPeriodo,
  finPeriodo,
  tituloPeriodo,
  moneda,
  todasCategorias,
  filtroCategoria,
  filtroTipo,
  filtroBusqueda,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarFiltros,
  onEditarTx,
  onEliminarTx,
}: TablaTransaccionesProps) {
  const [items, setItems] = useState<TransaccionDTO[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtroBusqueda);
  const [armadoTxId, setArmadoTxId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { simbolo } = obtenerMonedaInfo(moneda);

  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of todasCategorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [todasCategorias]);

  const opcionesTipo: CustomSelectOption[] = [
    { value: "todos", label: "Todos los tipos" },
    { value: "ingreso", label: "Solo Ingresos", color: "#10b981" },
    { value: "egreso", label: "Solo Egresos", color: "#ef4444" },
  ];

  const opcionesCat: CustomSelectOption[] = [
    { value: "todas", label: "Todas las categorías" },
    ...todasCategorias.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#3b82f6",
    })),
  ];

  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
  }, [initialItems, initialHasMore]);

  useEffect(() => {
    setBusquedaLocal(filtroBusqueda);
  }, [filtroBusqueda]);

  useEffect(() => {
    if (armadoTxId === null) return;
    const timer = setTimeout(() => setArmadoTxId(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoTxId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busquedaLocal !== filtroBusqueda) {
        void onCambiarFiltros({
          categoria: filtroCategoria,
          tipo: filtroTipo,
          busqueda: busquedaLocal,
        });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [busquedaLocal, filtroBusqueda, filtroCategoria, filtroTipo, onCambiarFiltros]);

  const cargarMas = async () => {
    if (cargandoMas || !hasMore) return;
    setCargandoMas(true);
    try {
      const qs = new URLSearchParams({
        offset: String(items.length),
        limit: "30",
        desde: inicioPeriodo,
        hasta: finPeriodo,
        tipo: filtroTipo,
        categoria: filtroCategoria,
        q: filtroBusqueda,
      });
      const res = await fetch(`/api/transacciones?${qs.toString()}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.items)) {
        setItems((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const nuevos = (data.items as TransaccionDTO[]).filter(
            (n) => !ids.has(n.id)
          );
          return [...prev, ...nuevos];
        });
        setHasMore(Boolean(data.has_more));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al cargar más transacciones:", error);
    } finally {
      setCargandoMas(false);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || cargandoMas || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      void cargarMas();
    }
  };

  const handleDobleClickEliminar = async (txId: number) => {
    if (armadoTxId !== txId) {
      setArmadoTxId(txId);
      return;
    }
    setArmadoTxId(null);
    await onEliminarTx(txId);
  };

  return (
    <section className="panel" id="movimientos">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <EditableText
              clave="tituloHistorial"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Periodo activo: {tituloPeriodo} · Mostrando {items.length} registro(s)
          </span>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            value={busquedaLocal}
            onChange={(e) => setBusquedaLocal(e.target.value)}
            placeholder="Buscar descripción..."
            className="input-control"
            style={{ width: "180px", padding: "7px 10px", fontSize: "0.85rem" }}
          />

          <CustomSelect
            ariaLabel="Filtrar por tipo"
            className="compact"
            value={filtroTipo}
            options={opcionesTipo}
            onChange={(val) =>
              void onCambiarFiltros({
                categoria: filtroCategoria,
                tipo: val as "todos" | "ingreso" | "egreso",
                busqueda: busquedaLocal,
              })
            }
          />

          <CustomSelect
            id="filtro-categoria"
            ariaLabel="Filtrar por categoría"
            className="compact"
            menuAlign="right"
            value={filtroCategoria}
            options={opcionesCat}
            onChange={(val) =>
              void onCambiarFiltros({
                categoria: val,
                tipo: filtroTipo,
                busqueda: busquedaLocal,
              })
            }
          />
        </div>
      </div>

      <div
        id="tablaScrollContainer"
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: "450px",
          overflowY: "auto",
          border: "1px solid var(--border-hairline)",
          borderRadius: "8px",
        }}
      >
        <table className="tx-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th className="num">Monto ({simbolo})</th>
              <th className="num">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((tx) => (
                <tr key={tx.id}>
                  <td className="tabular-nums" style={{ fontSize: "0.82rem" }}>
                    {tx.fecha_fmt}{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      {tx.hora_fmt}
                    </span>
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
                    {mostrarMontoMoneda(
                      tx.monto_fmt,
                      modoPrivacidad,
                      moneda,
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
                          <AppIcon name="papelera" size={14} />
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
                    No hay transacciones registradas con estos filtros.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cargandoMas && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
          }}
        >
          ⏳ Cargando más transacciones...
        </div>
      )}
    </section>
  );
}

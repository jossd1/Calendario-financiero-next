"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AppIcon from "@/components/AppIcon";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import EditableText from "@/components/EditableText";
import { DIAS_SEMANA_ES, MESES_ES, parseIsoDateParts } from "@/lib/format";
import {
  formatoMoneda,
  mostrarMontoMoneda,
  obtenerMonedaInfo,
} from "@/lib/monedas";
import type { CategoriaDTO, TextosUI, TransaccionDTO } from "@/types";

interface TablaTransaccionesProps {
  initialItems: TransaccionDTO[];
  tituloPeriodo: string;
  hoyAnio: string;
  moneda: string;
  todasCategorias: CategoriaDTO[];
  filtroMes: string;
  filtroAnio: string;
  sinLimiteHistorial: boolean;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarFiltros: (filtros: { mes: string; anio: string }) => Promise<void>;
  onEditarTx: (tx: TransaccionDTO) => void;
  onEliminarTx: (txId: number) => Promise<void>;
}

export default function TablaTransacciones({
  initialItems,
  tituloPeriodo,
  hoyAnio,
  moneda,
  todasCategorias,
  filtroMes,
  filtroAnio,
  sinLimiteHistorial,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarFiltros,
  onEditarTx,
  onEliminarTx,
}: TablaTransaccionesProps) {
  const [armadoTxId, setArmadoTxId] = useState<number | null>(null);
  const { simbolo } = obtenerMonedaInfo(moneda);

  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of todasCategorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [todasCategorias]);

  const esModoVerMes = filtroMes !== "todos";
  const mesNum = Number(filtroMes);
  const nombreMesActivo =
    esModoVerMes && Number.isInteger(mesNum) ? MESES_ES[mesNum] : "";

  const opcionesMes: CustomSelectOption[] = [
    { value: "todos", label: "Buscar Mes (Periodo activo)" },
    ...MESES_ES.slice(1).map((nombre, idx) => ({
      value: String(idx + 1).padStart(2, "0"),
      label: nombre,
    })),
  ];

  const baseAnio = Number(hoyAnio) || new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 11 }, (_, i) =>
    String(baseAnio - 6 + i)
  );
  if (!aniosDisponibles.includes(filtroAnio)) {
    aniosDisponibles.push(filtroAnio);
    aniosDisponibles.sort();
  }

  const opcionesAnio: CustomSelectOption[] = aniosDisponibles.map((a) => ({
    value: a,
    label: `En (${a})`,
  }));

  const agrupadosPorDia = useMemo(() => {
    if (!esModoVerMes) return [];
    const mapa = new Map<string, TransaccionDTO[]>();
    for (const tx of initialItems) {
      const arr = mapa.get(tx.fecha_iso) ?? [];
      arr.push(tx);
      mapa.set(tx.fecha_iso, arr);
    }
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [initialItems, esModoVerMes]);

  useEffect(() => {
    if (armadoTxId === null) return;
    const timer = setTimeout(() => setArmadoTxId(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoTxId]);

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
      <div className="panel-header" style={{ gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h3 className="panel-title">
            <EditableText
              clave="tituloHistorial"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>

          {esModoVerMes ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "3px 10px",
                borderRadius: "8px",
                background: "rgba(168, 85, 247, 0.14)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                color: "#d8b4fe",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              <span>👁️ Ver Mes: {nombreMesActivo} {filtroAnio}</span>
              <button
                type="button"
                onClick={() => void onCambiarFiltros({ mes: "todos", anio: filtroAnio })}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#d8b4fe",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  lineHeight: 1,
                  padding: "0 2px",
                }}
                title="Volver a periodo activo"
              >
                ✕
              </button>
            </div>
          ) : (
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Periodo activo: {tituloPeriodo} · {initialItems.length} reg.
            </span>
          )}
        </div>

        <div className="filter-bar">
          <CustomSelect
            ariaLabel="Buscar Mes"
            className="compact"
            value={filtroMes}
            options={opcionesMes}
            onChange={(val) =>
              void onCambiarFiltros({ mes: val, anio: filtroAnio })
            }
          />

          <CustomSelect
            ariaLabel="Año del historial"
            className="compact"
            menuAlign="right"
            value={filtroAnio}
            options={opcionesAnio}
            onChange={(val) =>
              void onCambiarFiltros({ mes: filtroMes, anio: val })
            }
          />
        </div>
      </div>

      <div
        id="tablaScrollContainer"
        style={
          sinLimiteHistorial
            ? { border: "1px solid var(--border-hairline)", borderRadius: "8px" }
            : {
                maxHeight: "620px",
                overflowY: "auto",
                border: "1px solid var(--border-hairline)",
                borderRadius: "8px",
              }
        }
      >
        <table className="tx-table">
          <thead>
            <tr>
              <th style={{ width: esModoVerMes ? "110px" : "150px" }}>
                {esModoVerMes ? "Hora" : "Fecha / Hora"}
              </th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th className="num">Monto ({simbolo})</th>
              <th className="num">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialItems.length > 0 ? (
              esModoVerMes ? (
                agrupadosPorDia.map(([fechaIso, itemsDelDia]) => {
                  const parts = parseIsoDateParts(fechaIso);
                  const dowIndex =
                    (new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() + 6) % 7;
                  const diaNombre = DIAS_SEMANA_ES[dowIndex] ?? "";
                  const netoDia = itemsDelDia.reduce(
                    (acc, t) => acc + (t.tipo === "ingreso" ? t.monto : -t.monto),
                    0
                  );

                  return (
                    <Fragment key={fechaIso}>
                      <tr
                        style={{
                          backgroundColor: "rgba(168, 85, 247, 0.05)",
                          borderTop: "1px solid rgba(168, 85, 247, 0.22)",
                          borderBottom: "1px solid rgba(168, 85, 247, 0.12)",
                        }}
                      >
                        <td
                          colSpan={6}
                          style={{
                            padding: "7px 14px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: "#e9d5ff",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>
                              📅 {diaNombre} {parts.day} de {nombreMesActivo} ({itemsDelDia.length} mov.)
                            </span>
                            <span
                              className={`tabular-nums ${netoDia >= 0 ? "amt-in" : "amt-out"} ${
                                modoPrivacidad ? "privacy-dots" : ""
                              }`}
                              style={{ fontSize: "0.78rem", fontWeight: 700 }}
                            >
                              Neto día: {mostrarMontoMoneda(formatoMoneda(netoDia, moneda), modoPrivacidad, moneda)}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {itemsDelDia.map((tx) => (
                        <tr key={tx.id}>
                          <td className="tabular-nums" style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                            {tx.hora_fmt || "—"}
                          </td>
                          <td>
                            <span className={tx.tipo === "ingreso" ? "amt-in" : "amt-out"} style={{ fontWeight: 600 }}>
                              {tx.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                              <span
                                className="cat-color-dot"
                                style={{ backgroundColor: colorPorCategoria.get(tx.categoria) ?? "#3b82f6" }}
                              />
                              <span>{tx.categoria}</span>
                              {tx.subperfil_nombre && (
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                  ({tx.subperfil_nombre})
                                </span>
                              )}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{tx.descripcion || "—"}</td>
                          <td
                            className={`num tabular-nums ${tx.tipo === "ingreso" ? "amt-in" : "amt-out"} ${
                              modoPrivacidad ? "privacy-dots" : ""
                            }`}
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
                                className={`btn btn-danger btn-sm ${armadoTxId === tx.id ? "btn-danger-armed" : ""}`}
                                style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                                title="Eliminar"
                              >
                                {armadoTxId === tx.id ? "⚠️ ¿Seguro?" : <AppIcon name="papelera" size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              ) : (
                initialItems.map((tx) => (
                  <tr key={tx.id}>
                    <td className="tabular-nums" style={{ fontSize: "0.82rem" }}>
                      {tx.fecha_fmt} <span style={{ color: "var(--text-secondary)" }}>{tx.hora_fmt}</span>
                    </td>
                    <td>
                      <span className={tx.tipo === "ingreso" ? "amt-in" : "amt-out"} style={{ fontWeight: 600 }}>
                        {tx.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                        <span
                          className="cat-color-dot"
                          style={{ backgroundColor: colorPorCategoria.get(tx.categoria) ?? "#3b82f6" }}
                        />
                        <span>{tx.categoria}</span>
                        {tx.subperfil_nombre && (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            ({tx.subperfil_nombre})
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{tx.descripcion || "—"}</td>
                    <td
                      className={`num tabular-nums ${tx.tipo === "ingreso" ? "amt-in" : "amt-out"} ${
                        modoPrivacidad ? "privacy-dots" : ""
                      }`}
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
                          className={`btn btn-danger btn-sm ${armadoTxId === tx.id ? "btn-danger-armed" : ""}`}
                          style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                          title="Eliminar"
                        >
                          {armadoTxId === tx.id ? "⚠️ ¿Seguro?" : <AppIcon name="papelera" size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No hay transacciones registradas en este periodo.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
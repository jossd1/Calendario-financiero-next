"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EditableText from "@/components/EditableText";
import type { CategoriaDTO, TextosUI, TipoMovimiento } from "@/types";

interface FormularioRegistroProps {
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  categoriaPredeterminada: string;
  fechaSeleccionada: string;
  hoyIso: string;
  focusPing: number;
  textos: TextosUI;
  editModeTextos: boolean;
  programadosActivos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarFechaSeleccionada: (fecha: string) => void;
  onRegistrarExito: (fechaTx: string) => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export default function FormularioRegistro({
  categoriasEgreso,
  categoriasIngreso,
  categoriaPredeterminada,
  fechaSeleccionada,
  hoyIso,
  focusPing,
  textos,
  editModeTextos,
  programadosActivos,
  onGuardarTexto,
  onCambiarFechaSeleccionada,
  onRegistrarExito,
  onNotificar,
  onToastSutil,
}: FormularioRegistroProps) {
  const todasCategorias = useMemo(
    () => [...categoriasEgreso, ...categoriasIngreso],
    [categoriasEgreso, categoriasIngreso]
  );

  const catInicial =
    todasCategorias.find((c) => c.nombre === categoriaPredeterminada) ??
    categoriasEgreso[0] ??
    categoriasIngreso[0];

  const [tipo, setTipo] = useState<TipoMovimiento>(catInicial?.tipo ?? "egreso");
  const [montoTexto, setMontoTexto] = useState("");
  const [categoria, setCategoria] = useState<string>(catInicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState("");
  const [estadoTx, setEstadoTx] = useState<"pagado" | "pendiente" | "programado">("pagado");
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<"pagado" | "pendiente" | "programado">("pagado");

  const inputMontoRef = useRef<HTMLInputElement | null>(null);
  const inputDescRef = useRef<HTMLInputElement | null>(null);
  const ultimoCampoActivoRef = useRef<"monto" | "descripcion">("monto");

  useEffect(() => {
    if (!programadosActivos && estado === "programado") {
      setEstado("pagado");
    }
  }, [programadosActivos, estado]);

  useEffect(() => {
    if (focusPing <= 0) return;
    if (ultimoCampoActivoRef.current === "descripcion") {
      inputDescRef.current?.focus();
    } else {
      inputMontoRef.current?.focus();
    }
  }, [focusPing]);

  useEffect(() => {
    const existe = todasCategorias.some((c) => c.nombre === categoria);
    if (!existe) {
      const primera =
        tipo === "ingreso"
          ? categoriasIngreso[0]?.nombre
          : categoriasEgreso[0]?.nombre;
      if (primera) setCategoria(primera);
    }
  }, [todasCategorias, categoria, tipo, categoriasEgreso, categoriasIngreso]);

  const analisisEntrada = useMemo(() => {
    const texto = montoTexto.trim();
    if (!texto) return null;

    const match = texto.match(/^(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
    if (!match) {
      return {
        monto: null,
        sufijo: texto.toLowerCase(),
        cat: null as CategoriaDTO | null,
      };
    }

    const monto = match[1].replace(",", ".");
    const sufijo = (match[2] ?? "").trim().toLowerCase();

    if (!sufijo) {
      return { monto, sufijo: "", cat: null as CategoriaDTO | null };
    }

    const encontrada =
      todasCategorias.find(
        (c) => Boolean(c.atajo) && c.atajo.trim().toLowerCase() === sufijo
      ) ?? null;

    return { monto, sufijo, cat: encontrada };
  }, [montoTexto, todasCategorias]);

  const handleCambioTipo = (nuevoTipo: TipoMovimiento) => {
    setTipo(nuevoTipo);
    const lista =
      nuevoTipo === "ingreso" ? categoriasIngreso : categoriasEgreso;
    if (lista.length > 0) {
      setCategoria(lista[0].nombre);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!montoTexto.trim()) {
      onToastSutil("Ingresa un monto válido para registrar.");
      return;
    }

    if (
      !analisisEntrada ||
      !analisisEntrada.monto ||
      Number(analisisEntrada.monto) <= 0
    ) {
      setMontoTexto("");
      onToastSutil("Entrada inválida. Se limpió el campo.");
      inputMontoRef.current?.focus();
      return;
    }

    if (analisisEntrada.sufijo && !analisisEntrada.cat) {
      const atajoFallido = analisisEntrada.sufijo;
      setMontoTexto("");
      onToastSutil(`Atajo "${atajoFallido}" no encontrado. Campo limpiado.`);
      inputMontoRef.current?.focus();
      return;
    }

    let tipoFinal = tipo;
    let categoriaFinal = categoria;

    if (analisisEntrada.cat) {
      tipoFinal = analisisEntrada.cat.tipo;
      categoriaFinal = analisisEntrada.cat.nombre;
      setTipo(tipoFinal);
      setCategoria(categoriaFinal);
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoFinal,
          monto: analisisEntrada.monto,
          categoria: categoriaFinal,
          descripcion,
          fecha: fechaSeleccionada,
          estado: programadosActivos ? estadoTx : "pagado",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo registrar.");
        return;
      }

      setMontoTexto("");
      setDescripcion("");
      setEstadoTx("pagado");
      onNotificar("success", data.mensaje ?? "Registrado con éxito.");
      await onRegistrarExito(data.fecha_tx);
      inputMontoRef.current?.focus();
    } catch {
      onNotificar("error", "Error de red al guardar la transacción.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <aside className="panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <EditableText
            clave="tituloRegistroRapido"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </h3>
        <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)" }}>
          <EditableText
            clave="subtituloAtajos"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-field">
          <label>
            <EditableText
              clave="labelTipoOperacion"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </label>
          <div className="type-toggle">
            <label className="type-radio">
              <input
                type="radio"
                name="tipo"
                value="ingreso"
                checked={tipo === "ingreso"}
                onChange={() => handleCambioTipo("ingreso")}
              />
              <span>Ingreso (+)</span>
            </label>
            <label className="type-radio">
              <input
                type="radio"
                name="tipo"
                value="egreso"
                checked={tipo === "egreso"}
                onChange={() => handleCambioTipo("egreso")}
              />
              <span>Egreso (-)</span>
            </label>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="monto">
            <EditableText
              clave="labelMontoAtajo"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </label>
          <input
            ref={inputMontoRef}
            id="monto"
            name="monto"
            type="text"
            autoComplete="off"
            placeholder="0.00 o 15al"
            value={montoTexto}
            onFocus={() => {
              ultimoCampoActivoRef.current = "monto";
            }}
            onChange={(e) => setMontoTexto(e.target.value)}
            className="input-control tabular-nums"
            required
          />
          <small
            style={{
              fontSize: "0.72rem",
              color: analisisEntrada?.cat
                ? "var(--accent-primary)"
                : analisisEntrada?.sufijo
                ? "var(--range-end-color)"
                : "var(--text-secondary)",
              minHeight: "16px",
            }}
          >
            {analisisEntrada?.cat
              ? `⚡ Atajo literal: [${analisisEntrada.cat.atajo}] -> ${analisisEntrada.cat.nombre}`
              : analisisEntrada?.sufijo
              ? `Sin coincidencia literal para "${analisisEntrada.sufijo}"`
              : ""}
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="categoria">
            <EditableText
              clave="labelCategoria"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </label>
          <select
            id="categoria"
            name="categoria"
            value={categoria}
            onChange={(e) => {
              const nombre = e.target.value;
              setCategoria(nombre);
              const encontrada = todasCategorias.find((c) => c.nombre === nombre);
              if (encontrada) setTipo(encontrada.tipo);
            }}
            className="input-control"
            required
          >
            <optgroup label="Egresos">
              {categoriasEgreso.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre} {cat.atajo ? `[${cat.atajo}]` : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ingresos">
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre} {cat.atajo ? `[${cat.atajo}]` : ""}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="fecha_tx">
            <EditableText
              clave="labelFechaTx"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              id="fecha_tx"
              name="fecha"
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => onCambiarFechaSeleccionada(e.target.value)}
              className="input-control tabular-nums"
              required
            />
            <button
              type="button"
              onClick={() => onCambiarFechaSeleccionada(hoyIso)}
              className="btn btn-secondary btn-sm"
            >
              Hoy
            </button>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="descripcion">
            <EditableText
              clave="labelDescripcion"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </label>
          <input
            ref={inputDescRef}
            id="descripcion"
            name="descripcion"
            type="text"
            maxLength={240}
            placeholder="Detalle..."
            value={descripcion}
            onFocus={() => {
              ultimoCampoActivoRef.current = "descripcion";
            }}
            onChange={(e) => setDescripcion(e.target.value)}
            className="input-control"
          />
        </div>
        {programadosActivos && (
          <div className="form-field">
            <label htmlFor="estado_tx">Estado del Movimiento</label>
            <select
              id="estado_tx"
              value={estadoTx}
              onChange={(e) =>
                setEstadoTx(
                  e.target.value as "pagado" | "pendiente" | "programado"
                )
              }
              className="input-control"
            >
              <option value="pagado">Pagado / Realizado</option>
              <option value="pendiente">Pendiente</option>
              <option value="programado">Programado</option>
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {enviando ? (
            "Guardando..."
          ) : (
            <EditableText
              clave="btnGuardarMovimiento"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          )}
        </button>
      </form>
    </aside>
  );
}
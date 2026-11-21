"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EditableText from "@/components/EditableText";
import CamposCompletosRegistro from "@/components/registro/CamposCompletosRegistro";
import { analizarEntradaMonto } from "@/lib/atajos";
import { formatearFechaDMY } from "@/lib/format";
import type { CategoriaDTO, TextosUI, TipoMovimiento } from "@/types";

interface FormularioRegistroProps {
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  categoriaPredeterminada: string;
  limitarAnios: boolean;
  fechaSeleccionada: string;
  hoyIso: string;
  focusPing: number;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarFechaSeleccionada: (fecha: string) => void;
  onMoverDiaFlecha: (deltaDias: number) => void;
  onRegistrarExito: (fechaTx: string) => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export default function FormularioRegistro({
  categoriasEgreso,
  categoriasIngreso,
  categoriaPredeterminada,
  limitarAnios,
  fechaSeleccionada,
  hoyIso,
  focusPing,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarFechaSeleccionada,
  onMoverDiaFlecha,
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

  const [modoSimple, setModoSimple] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>(catInicial?.tipo ?? "egreso");
  const [montoTexto, setMontoTexto] = useState("");
  const [categoria, setCategoria] = useState<string>(catInicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const inputMontoRef = useRef<HTMLInputElement | null>(null);
  const inputDescRef = useRef<HTMLInputElement | null>(null);
  const ultimoCampoActivoRef = useRef<"monto" | "descripcion">("monto");
  const modoSimpleRef = useRef(modoSimple);
  modoSimpleRef.current = modoSimple;

  useEffect(() => {
    const guardado = window.localStorage.getItem("cf_modo_simple");
    if (guardado === "1") setModoSimple(true);
  }, []);

  useEffect(() => {
    if (focusPing <= 0) return;
    if (!modoSimpleRef.current && ultimoCampoActivoRef.current === "descripcion") {
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

  useEffect(() => {
    if (!categoriaPredeterminada) return;
    const encontrada = todasCategorias.find(
      (c) => c.nombre === categoriaPredeterminada
    );
    if (encontrada) {
      setCategoria(encontrada.nombre);
      setTipo(encontrada.tipo);
    }
  }, [categoriaPredeterminada, todasCategorias]);

  const analisisEntrada = useMemo(
    () => analizarEntradaMonto(montoTexto, todasCategorias),
    [montoTexto, todasCategorias]
  );

  const toggleModoSimple = () => {
    const siguiente = !modoSimple;
    setModoSimple(siguiente);
    if (siguiente) {
      ultimoCampoActivoRef.current = "monto";
    }
    window.localStorage.setItem("cf_modo_simple", siguiente ? "1" : "0");
    requestAnimationFrame(() => {
      inputMontoRef.current?.focus();
    });
  };

  const handleCambioTipo = (nuevoTipo: TipoMovimiento) => {
    setTipo(nuevoTipo);
    const lista =
      nuevoTipo === "ingreso" ? categoriasIngreso : categoriasEgreso;
    if (lista.length > 0) setCategoria(lista[0].nombre);
  };

  const handleMontoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (montoTexto.trim() !== "") return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onMoverDiaFlecha(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onMoverDiaFlecha(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onMoverDiaFlecha(-7);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onMoverDiaFlecha(7);
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
          descripcion: modoSimple ? "" : descripcion,
          fecha: fechaSeleccionada,
          estado: "pagado",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo registrar.");
        return;
      }

      setMontoTexto("");
      setDescripcion("");
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
      <div className="panel-header" style={{ flexWrap: "nowrap", gap: "8px" }}>
        <h3 className="panel-title" style={{ whiteSpace: "nowrap" }}>
          <EditableText
            clave="tituloRegistroRapido"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </h3>

        <button
          type="button"
          onClick={toggleModoSimple}
          className={`btn-simple-toggle ${modoSimple ? "active" : ""}`}
          title={
            modoSimple
              ? "Actualmente en Modo Simple (clic para ver todo)"
              : "Actualmente en Modo Completo (clic para simplificar)"
          }
        >
          {modoSimple ? "Simple" : "Completo"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="type-toggle-unified">
          <label className="type-radio">
            <input
              type="radio"
              name="tipo"
              value="ingreso"
              checked={tipo === "ingreso"}
              onChange={() => handleCambioTipo("ingreso")}
            />
            <span>Ingreso(+)</span>
          </label>
          <label className="type-radio">
            <input
              type="radio"
              name="tipo"
              value="egreso"
              checked={tipo === "egreso"}
              onChange={() => handleCambioTipo("egreso")}
            />
            <span>Egreso(-)</span>
          </label>
        </div>

        <div className={!modoSimple ? "form-row-2col" : undefined}>
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
              onKeyDown={handleMontoKeyDown}
              onChange={(e) => setMontoTexto(e.target.value)}
              className="input-control tabular-nums"
              required
            />
          </div>

          {!modoSimple && (
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
                  min={limitarAnios ? "2000-01-01" : undefined}
                  max={limitarAnios ? "3000-12-31" : undefined}
                  value={fechaSeleccionada}
                  onChange={(e) => onCambiarFechaSeleccionada(e.target.value)}
                  className="input-control tabular-nums"
                  required
                />
                <button
                  type="button"
                  onClick={() => onCambiarFechaSeleccionada(hoyIso)}
                  className="btn btn-secondary btn-sm"
                  title="Ir a hoy"
                >
                  Hoy
                </button>
              </div>
            </div>
          )}
        </div>

        {(analisisEntrada?.cat || analisisEntrada?.sufijo || modoSimple) && (
          <small
            style={{
              fontSize: "0.72rem",
              marginTop: "-6px",
              color: analisisEntrada?.cat
                ? "var(--accent-primary)"
                : analisisEntrada?.sufijo
                ? "var(--range-end-color)"
                : "var(--text-secondary)",
            }}
          >
            {analisisEntrada?.cat
              ? `⚡ Atajo literal: [${analisisEntrada.cat.atajo}] -> ${analisisEntrada.cat.nombre}`
              : analisisEntrada?.sufijo
              ? `Sin coincidencia literal para "${analisisEntrada.sufijo}"`
              : `📅 ${formatearFechaDMY(fechaSeleccionada)} · ${categoria}`}
          </small>
        )}

        {!modoSimple && (
          <CamposCompletosRegistro
            categoria={categoria}
            categoriasEgreso={categoriasEgreso}
            categoriasIngreso={categoriasIngreso}
            descripcion={descripcion}
            inputDescRef={inputDescRef}
            textos={textos}
            editModeTextos={editModeTextos}
            onGuardarTexto={onGuardarTexto}
            onCambiarCategoria={(nombre) => {
              setCategoria(nombre);
              const encontrada = todasCategorias.find(
                (c) => c.nombre === nombre
              );
              if (encontrada) setTipo(encontrada.tipo);
            }}
            onCambiarDescripcion={setDescripcion}
            onFocusDescripcion={() => {
              ultimoCampoActivoRef.current = "descripcion";
            }}
          />
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
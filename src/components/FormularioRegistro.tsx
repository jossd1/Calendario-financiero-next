"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EditableText from "@/components/EditableText";
import CamposCompletosRegistro from "@/components/registro/CamposCompletosRegistro";
import { analizarEntradaMonto } from "@/lib/atajos";
import { formatearFechaDMY } from "@/lib/format";
import { obtenerMonedaInfo } from "@/lib/monedas";
import type {
  CategoriaDTO,
  SubperfilDTO,
  TextosUI,
  TipoMovimiento,
} from "@/types";

interface FormularioRegistroProps {
  moneda: string;
  subperfiles: SubperfilDTO[];
  subperfilId: number | null;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  categoriaPredeterminada: string;
  barraPreviewRegistro: boolean;
  limitarAnios: boolean;
  fechaSeleccionada: string;
  hoyIso: string;
  focusPing: number;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarFechaSeleccionada: (fecha: string) => void;
  onMoverDiaFlecha: (deltaDias: number) => void;
  onCambiarSubperfil: (id: number) => void;
  onRotarSubperfil: (delta: number) => void;
  onRegistrarExito: (fechaTx: string) => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export default function FormularioRegistro({
  moneda,
  subperfiles,
  subperfilId,
  categoriasEgreso,
  categoriasIngreso,
  categoriaPredeterminada,
  barraPreviewRegistro,
  limitarAnios,
  fechaSeleccionada,
  hoyIso,
  focusPing,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarFechaSeleccionada,
  onMoverDiaFlecha,
  onCambiarSubperfil,
  onRotarSubperfil,
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

  const [modoSimple, setModoSimple] = useState(true);
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

  const monedaInfo = obtenerMonedaInfo(moneda);

  useEffect(() => {
    const raw = window.localStorage.getItem("cf_modo_simple");
    setModoSimple(raw !== "0");
  }, []);

  const restaurarFoco = () => {
    requestAnimationFrame(() => {
      if (!modoSimpleRef.current && ultimoCampoActivoRef.current === "descripcion") {
        inputDescRef.current?.focus();
      } else {
        inputMontoRef.current?.focus();
      }
    });
  };

  useEffect(() => {
    if (focusPing <= 0) return;
    restaurarFoco();
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
    () => analizarEntradaMonto(montoTexto, todasCategorias, subperfiles),
    [montoTexto, todasCategorias, subperfiles]
  );

  const toggleModoSimple = () => {
    const siguiente = !modoSimple;
    setModoSimple(siguiente);
    if (siguiente) ultimoCampoActivoRef.current = "monto";
    window.localStorage.setItem("cf_modo_simple", siguiente ? "1" : "0");
    requestAnimationFrame(() => inputMontoRef.current?.focus());
  };

  const handleMontoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (montoTexto.trim() === "") {
      if (e.key === "ArrowLeft") { e.preventDefault(); onMoverDiaFlecha(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onMoverDiaFlecha(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); onMoverDiaFlecha(-7); }
      else if (e.key === "ArrowDown") { e.preventDefault(); onMoverDiaFlecha(7); }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      onRotarSubperfil(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onRotarSubperfil(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoTexto.trim()) {
      onToastSutil("Ingresa un monto válido para registrar.");
      return;
    }

    if (!analisisEntrada || !analisisEntrada.monto || Number(analisisEntrada.monto) <= 0) {
      setMontoTexto("");
      onToastSutil("Entrada inválida. Se limpió el campo.");
      inputMontoRef.current?.focus();
      return;
    }

    if (analisisEntrada.subperfilInvalido) {
      setMontoTexto("");
      onToastSutil(`Subperfil "${analisisEntrada.subperfilInvalido}" no encontrado.`);
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

    const subFinalId = analisisEntrada.subperfil?.id ?? subperfilId;

    setEnviando(true);
    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoFinal,
          monto: analisisEntrada.monto,
          categoria: categoriaFinal,
          subperfil_id: subFinalId,
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

  const usaBarraPreview = !modoSimple && barraPreviewRegistro;
  const atajoDetectado = analisisEntrada?.cat ?? null;
  const subActivo =
    analisisEntrada?.subperfil ??
    subperfiles.find((s) => s.id === subperfilId) ??
    subperfiles[0] ??
    null;

  const claseBarra = atajoDetectado
    ? atajoDetectado.tipo === "ingreso"
      ? "reg-preview-bar is-in"
      : "reg-preview-bar is-out"
    : "reg-preview-bar";

  const codigoBarra = atajoDetectado
    ? `[${atajoDetectado.atajo.padEnd(2, " ")}]`
    : "[  ]";

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
        {subperfiles.length > 0 && (
          <div className="subperfil-strip" title="Usa ↑ / ↓ con texto en Monto o clic para cambiar">
            {subperfiles.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onCambiarSubperfil(s.id);
                  restaurarFoco();
                }}
                className={`subperfil-chip ${
                  subActivo?.id === s.id ? "is-active" : ""
                }`}
              >
                <span>{s.icono}</span>
                <span>{s.nombre}</span>
                <code>[{s.atajo}]</code>
              </button>
            ))}
          </div>
        )}

        {usaBarraPreview && (
          <div className={claseBarra}>
            <div className="reg-preview-left">
              <span
                className="cat-color-dot"
                style={{
                  backgroundColor: atajoDetectado
                    ? atajoDetectado.color
                    : "#64748b",
                }}
              />
              <span className="reg-preview-text">
                {atajoDetectado ? `  ${atajoDetectado.nombre}` : "  Atajo"}
              </span>
            </div>
            <div className="reg-preview-right">
              {atajoDetectado && (
                <span style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                  {atajoDetectado.tipo === "ingreso"
                    ? "Ingreso (+)"
                    : "Egreso (-)"}
                </span>
              )}
              <code className="reg-preview-code">{codigoBarra}</code>
            </div>
          </div>
        )}

        <div className={!modoSimple ? "form-row-2col" : undefined}>
          <div className="form-field">
            <label htmlFor="monto">
              <EditableText
                clave="labelMontoAtajo"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                ({monedaInfo.simbolo})
              </span>
            </label>
            <input
              ref={inputMontoRef}
              id="monto"
              name="monto"
              type="text"
              autoComplete="off"
              placeholder="0.00"
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
              <div className="date-hoy-combo">
                <input
                  id="fecha_tx"
                  name="fecha"
                  type="date"
                  min={limitarAnios ? "2000-01-01" : undefined}
                  max={limitarAnios ? "3000-12-31" : undefined}
                  value={fechaSeleccionada}
                  onChange={(e) => onCambiarFechaSeleccionada(e.target.value)}
                  className="date-hoy-input tabular-nums"
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onCambiarFechaSeleccionada(hoyIso);
                    restaurarFoco();
                  }}
                  className="date-hoy-btn"
                  title="Ir a hoy"
                >
                  Hoy
                </button>
              </div>
            </div>
          )}
        </div>

        {(!usaBarraPreview && (analisisEntrada?.cat || analisisEntrada?.sufijo || analisisEntrada?.subperfilInvalido || modoSimple)) && (
          <small
            style={{
              fontSize: "0.72rem",
              marginTop: "-6px",
              color: analisisEntrada?.subperfilInvalido
                ? "var(--range-end-color)"
                : analisisEntrada?.cat
                ? analisisEntrada.cat.tipo === "ingreso"
                  ? "var(--income-color)"
                  : "var(--expense-color)"
                : analisisEntrada?.sufijo
                ? "var(--range-end-color)"
                : "var(--text-secondary)",
            }}
          >
            {analisisEntrada?.subperfilInvalido
              ? `Subperfil "${analisisEntrada.subperfilInvalido}" no encontrado`
              : analisisEntrada?.cat
              ? `⚡ [${analisisEntrada.cat.atajo}] → ${analisisEntrada.cat.nombre}${subActivo ? ` · ${subActivo.icono} ${subActivo.nombre}` : ""}`
              : analisisEntrada?.sufijo
              ? `Sin coincidencia literal para "${analisisEntrada.sufijo}"`
              : `📅 ${formatearFechaDMY(fechaSeleccionada)}${subActivo ? ` · ${subActivo.icono} ${subActivo.nombre}` : ""}`}
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

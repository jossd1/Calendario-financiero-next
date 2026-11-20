"use client";

import { useEffect, useRef, useState } from "react";
import { MESES_ES, buildIsoDate, esFechaISOValida } from "@/lib/format";

interface ModalBuscadorMagicoProps {
  abierto: boolean;
  onCerrar: () => void;
  onNavegar: (fechaIso: string, vistaDestino: "mensual" | "dia") => void;
}

type Paso = "dia" | "mes" | "anio";

export default function ModalBuscadorMagico({
  abierto,
  onCerrar,
  onNavegar,
}: ModalBuscadorMagicoProps) {
  const [incluirDia, setIncluirDia] = useState(false);
  const [paso, setPaso] = useState<Paso>("mes");
  const [diaTexto, setDiaTexto] = useState("");
  const [mesTexto, setMesTexto] = useState("");
  const [anioDosDigitos, setAnioDosDigitos] = useState("");
  const [errorCampo, setErrorCampo] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("cf_buscador_dia");
    if (saved === "1") setIncluirDia(true);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const saved = window.localStorage.getItem("cf_buscador_dia") === "1";
    setIncluirDia(saved);
    setPaso(saved ? "dia" : "mes");
    setDiaTexto("");
    setMesTexto("");
    setAnioDosDigitos("");
    setErrorCampo(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space" || e.key === " ") {
        e.preventDefault();
        onCerrar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const mesNum = Number(mesTexto);
  const nombreMes =
    mesTexto && Number.isInteger(mesNum) && mesNum >= 1 && mesNum <= 12
      ? MESES_ES[mesNum]
      : "";

  const toggleIncluirDia = (activo: boolean) => {
    setIncluirDia(activo);
    window.localStorage.setItem("cf_buscador_dia", activo ? "1" : "0");
    setPaso(activo ? "dia" : "mes");
    setDiaTexto("");
    setMesTexto("");
    setAnioDosDigitos("");
    setErrorCampo(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const dispararError = () => {
    setErrorCampo(true);
    setTimeout(() => setErrorCampo(false), 900);
  };

  const avanzarOSaltar = () => {
    if (paso === "dia") {
      const d = Number(diaTexto);
      if (!diaTexto || !Number.isInteger(d) || d < 1 || d > 31) {
        dispararError();
        return;
      }
      setErrorCampo(false);
      setPaso("mes");
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }

    if (paso === "mes") {
      const m = Number(mesTexto);
      if (!mesTexto || !Number.isInteger(m) || m < 1 || m > 12) {
        dispararError();
        return;
      }
      setErrorCampo(false);
      setPaso("anio");
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }

    if (anioDosDigitos.length !== 2) {
      dispararError();
      return;
    }

    const anioFull = Number(`20${anioDosDigitos}`);
    const m = Number(mesTexto);
    const d = incluirDia ? Number(diaTexto) : 1;
    const fechaIso = buildIsoDate(anioFull, m, d);

    if (!esFechaISOValida(fechaIso)) {
      dispararError();
      return;
    }

    onNavegar(fechaIso, incluirDia ? "dia" : "mensual");
    onCerrar();
  };

  const valorActual =
    paso === "dia" ? diaTexto : paso === "mes" ? mesTexto : anioDosDigitos;

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/\D/g, "").slice(0, 2);
    setErrorCampo(false);
    if (paso === "dia") setDiaTexto(soloDigitos);
    else if (paso === "mes") setMesTexto(soloDigitos);
    else setAnioDosDigitos(soloDigitos);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      avanzarOSaltar();
    } else if (e.key === "Backspace" && !valorActual) {
      if (paso === "anio") setPaso("mes");
      else if (paso === "mes" && incluirDia) setPaso("dia");
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "420px" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="magic-modal-box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={incluirDia}
                onChange={(e) => toggleIncluirDia(e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer" }}
              />
              Incluir Día
            </label>

            <button
              type="button"
              onClick={onCerrar}
              className="btn btn-secondary btn-sm"
              style={{ padding: "3px 10px", fontSize: "0.76rem" }}
              title="Cancelar (Espacio / Esc)"
            >
              Cancelar
            </button>
          </div>

          <div key={nombreMes || paso} className="magic-month-preview">
            {nombreMes
              ? incluirDia && diaTexto
                ? `${diaTexto} de ${nombreMes}`
                : nombreMes
              : paso === "dia"
              ? "Día"
              : paso === "mes"
              ? "Mes"
              : "Año"}
          </div>

          <div className={`magic-input-wrap ${errorCampo ? "is-error" : ""}`}>
            {paso === "anio" && (
              <span
                className="tabular-nums"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                20
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={valorActual}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={paso === "dia" ? "DD" : paso === "mes" ? "MM" : "AA"}
              className="magic-input-field"
              aria-label={`Ingresar ${paso}`}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "0.78rem",
              color: errorCampo
                ? "#f87171"
                : "var(--text-secondary)",
              minHeight: "20px",
              marginBottom: "14px",
            }}
          >
            {errorCampo
              ? "Valor fuera de rango o fecha inválida."
              : paso === "dia"
              ? "Digita el día (1–31) y presiona Enter"
              : paso === "mes"
              ? "Digita el mes (1–12) y presiona Enter"
              : "Digita los 2 últimos dígitos del año y presiona Enter para Ir ↵"}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--border-hairline)",
              paddingTop: "10px",
            }}
          >
            <span>Espacio = Cancelar · Backspace = Atrás</span>
            <button
              type="button"
              onClick={avanzarOSaltar}
              className="btn btn-primary btn-sm"
              style={{ padding: "4px 12px" }}
            >
              {paso === "anio" ? "Ir ↵" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import {
  addDaysISO,
  formatoSoles,
  mostrarMonto,
  obtenerHoyPeruISO,
} from "@/lib/format";
import type { AnalisisResultadoDTO } from "@/types";

interface FiltroManualAnalisisProps {
  analisis: AnalisisResultadoDTO;
  manualDesde: string;
  manualHasta: string;
  manualTipo: "todos" | "ingreso" | "egreso";
  modoPrivacidad: boolean;
  onAplicarManual: (
    desde: string,
    hasta: string,
    tipo: "todos" | "ingreso" | "egreso"
  ) => Promise<void>;
  onResetearAutomatico: () => Promise<void>;
}

export default function FiltroManualAnalisis({
  analisis,
  manualDesde,
  manualHasta,
  manualTipo,
  modoPrivacidad,
  onAplicarManual,
  onResetearAutomatico,
}: FiltroManualAnalisisProps) {
  const [desdeInput, setDesdeInput] = useState(manualDesde || analisis.desde);
  const [hastaInput, setHastaInput] = useState(manualHasta || analisis.hasta);
  const [tipoInput, setTipoInput] = useState<"todos" | "ingreso" | "egreso">(
    manualTipo
  );

  useEffect(() => {
    setDesdeInput(manualDesde || analisis.desde);
    setHastaInput(manualHasta || analisis.hasta);
  }, [manualDesde, manualHasta, analisis.desde, analisis.hasta]);

  useEffect(() => {
    setTipoInput(manualTipo);
  }, [manualTipo]);

  const aplicarPreset = async (diasAtras: number | "anio") => {
    const hoy = obtenerHoyPeruISO();
    const desde =
      diasAtras === "anio" ? `${hoy.slice(0, 4)}-01-01` : addDaysISO(hoy, -diasAtras);
    setDesdeInput(desde);
    setHastaInput(hoy);
    await onAplicarManual(desde, hoy, tipoInput);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desdeInput || !hastaInput) return;
    await onAplicarManual(desdeInput, hastaInput, tipoInput);
  };

  const maskClass = modoPrivacidad ? "privacy-dots" : "";

  return (
    <div className="manual-compact-bar">
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="date"
          aria-label="Desde"
          value={desdeInput}
          onChange={(e) => setDesdeInput(e.target.value)}
          className="input-control tabular-nums"
          style={{ width: "auto", padding: "5px 8px", fontSize: "0.8rem" }}
          required
        />
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>→</span>
        <input
          type="date"
          aria-label="Hasta"
          value={hastaInput}
          onChange={(e) => setHastaInput(e.target.value)}
          className="input-control tabular-nums"
          style={{ width: "auto", padding: "5px 8px", fontSize: "0.8rem" }}
          required
        />
        <select
          aria-label="Tipo de movimiento"
          value={tipoInput}
          onChange={(e) =>
            setTipoInput(e.target.value as "todos" | "ingreso" | "egreso")
          }
          className="input-control"
          style={{ width: "auto", padding: "5px 8px", fontSize: "0.8rem" }}
        >
          <option value="todos">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Aplicar
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => void onResetearAutomatico()}
          title="Volver al modo Automático"
        >
          ✕ Auto
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="manual-chip-btn"
          onClick={() => void aplicarPreset(7)}
        >
          7d
        </button>
        <button
          type="button"
          className="manual-chip-btn"
          onClick={() => void aplicarPreset(30)}
        >
          30d
        </button>
        <button
          type="button"
          className="manual-chip-btn"
          onClick={() => void aplicarPreset(90)}
        >
          Trimestre
        </button>
        <button
          type="button"
          className="manual-chip-btn"
          onClick={() => void aplicarPreset("anio")}
        >
          Este Año
        </button>

        <span
          className={`tabular-nums amt-in ${maskClass}`}
          style={{ fontSize: "0.78rem", fontWeight: 600, marginLeft: "6px" }}
        >
          +{mostrarMonto(formatoSoles(analisis.total_ingresos), modoPrivacidad)}
        </span>
        <span
          className={`tabular-nums amt-out ${maskClass}`}
          style={{ fontSize: "0.78rem", fontWeight: 600 }}
        >
          -{mostrarMonto(formatoSoles(analisis.total_egresos), modoPrivacidad)}
        </span>
        <span
          className={`tabular-nums ${
            analisis.balance_neto >= 0 ? "amt-in" : "amt-out"
          } ${maskClass}`}
          style={{ fontSize: "0.78rem", fontWeight: 700 }}
        >
          = {mostrarMonto(formatoSoles(analisis.balance_neto), modoPrivacidad)}
        </span>
      </div>
    </div>
  );
}
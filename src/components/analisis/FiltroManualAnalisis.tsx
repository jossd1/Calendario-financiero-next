"use client";

import { useEffect, useState } from "react";
import { formatoSoles, mostrarMonto } from "@/lib/format";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desdeInput || !hastaInput) return;
    await onAplicarManual(desdeInput, hastaInput, tipoInput);
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.25)",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid var(--border-hairline)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          alignItems: "flex-end",
        }}
      >
        <div className="form-field">
          <label>Desde</label>
          <input
            type="date"
            value={desdeInput}
            onChange={(e) => setDesdeInput(e.target.value)}
            className="input-control tabular-nums"
            required
          />
        </div>
        <div className="form-field">
          <label>Hasta</label>
          <input
            type="date"
            value={hastaInput}
            onChange={(e) => setHastaInput(e.target.value)}
            className="input-control tabular-nums"
            required
          />
        </div>
        <div className="form-field">
          <label>Tipo</label>
          <select
            value={tipoInput}
            onChange={(e) =>
              setTipoInput(e.target.value as "todos" | "ingreso" | "egreso")
            }
            className="input-control"
          >
            <option value="todos">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            Aplicar
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => void onResetearAutomatico()}
          >
            Automático
          </button>
        </div>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-hairline)",
          fontSize: "0.85rem",
        }}
      >
        <div>
          <span style={{ color: "var(--text-secondary)" }}>
            Ingresos del Rango:{" "}
          </span>
          <strong
            className={`tabular-nums amt-in ${
              modoPrivacidad ? "privacy-dots" : ""
            }`}
          >
            {mostrarMonto(formatoSoles(analisis.total_ingresos), modoPrivacidad)}
          </strong>
        </div>
        <div>
          <span style={{ color: "var(--text-secondary)" }}>
            Egresos del Rango:{" "}
          </span>
          <strong
            className={`tabular-nums amt-out ${
              modoPrivacidad ? "privacy-dots" : ""
            }`}
          >
            {mostrarMonto(formatoSoles(analisis.total_egresos), modoPrivacidad)}
          </strong>
        </div>
        <div>
          <span style={{ color: "var(--text-secondary)" }}>
            Balance del Rango:{" "}
          </span>
          <strong
            className={`tabular-nums ${
              analisis.balance_neto >= 0 ? "amt-in" : "amt-out"
            } ${modoPrivacidad ? "privacy-dots" : ""}`}
          >
            {mostrarMonto(formatoSoles(analisis.balance_neto), modoPrivacidad)}
          </strong>
        </div>
      </div>
    </div>
  );
}
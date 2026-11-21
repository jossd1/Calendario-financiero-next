"use client";

import EditableText from "@/components/EditableText";
import { formatoSoles, mostrarMonto } from "@/lib/format";
import type { ComparativaKpiDTO, TextosUI, TopEgresoKpiDTO } from "@/types";

interface KpiResumenProps {
  tituloPeriodo: string;
  totalIngresos: number;
  totalEgresos: number;
  balanceNeto: number;
  comparativaKpi: ComparativaKpiDTO | null;
  topEgresoKpi: TopEgresoKpiDTO | null;
  mostrarComparativa: boolean;
  mostrarTopEgreso: boolean;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
}

export default function KpiResumen({
  tituloPeriodo,
  totalIngresos,
  totalEgresos,
  balanceNeto,
  comparativaKpi,
  topEgresoKpi,
  mostrarComparativa,
  mostrarTopEgreso,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
}: KpiResumenProps) {
  const mostrarCuartoKpi = Boolean(mostrarTopEgreso && topEgresoKpi);
  const balanceColor = balanceNeto >= 0 ? "#38bdf8" : "#ef4444";

  const renderDeltaPct = (delta: number | null, invertirColores = false) => {
    if (delta === null) {
      return (
        <span className="kpi-delta" style={{ color: "var(--text-muted)" }}>
          Sin base en periodo anterior
        </span>
      );
    }

    const positivo = delta >= 0;
    const bueno = invertirColores ? delta <= 0 : delta >= 0;
    const flecha = positivo ? "▲" : "▼";
    const signo = positivo ? "+" : "";

    return (
      <span className={`kpi-delta tabular-nums ${bueno ? "amt-in" : "amt-out"}`}>
        {flecha} {signo}
        {delta}% vs periodo anterior
      </span>
    );
  };

  return (
    <section className={`kpi-grid ${mostrarCuartoKpi ? "kpi-grid-4" : ""}`}>
      <article className="kpi-card">
        <div className="kpi-card-top">
          <span className="kpi-title">
            <EditableText
              clave="kpiIngresosTitulo"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </span>
          <span
            className="kpi-icon-badge"
            style={{
              color: "var(--income-color)",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              borderColor: "rgba(16, 185, 129, 0.28)",
            }}
            aria-hidden="true"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </span>
        </div>
        <strong
          className={`kpi-value income ${modoPrivacidad ? "privacy-dots" : ""}`}
        >
          {mostrarMonto(formatoSoles(totalIngresos), modoPrivacidad)}
        </strong>
        {mostrarComparativa && comparativaKpi && (
          <div>{renderDeltaPct(comparativaKpi.ingresos_pct_delta, false)}</div>
        )}
        <span className="kpi-meta">
          {tituloPeriodo} ·{" "}
          <EditableText
            clave="kpiIngresosSub"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
      </article>

      <article className="kpi-card">
        <div className="kpi-card-top">
          <span className="kpi-title">
            <EditableText
              clave="kpiEgresosTitulo"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </span>
          <span
            className="kpi-icon-badge"
            style={{
              color: "var(--expense-color)",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              borderColor: "rgba(239, 68, 68, 0.28)",
            }}
            aria-hidden="true"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
              <polyline points="16 17 22 17 22 11" />
            </svg>
          </span>
        </div>
        <strong
          className={`kpi-value expense ${modoPrivacidad ? "privacy-dots" : ""}`}
        >
          {mostrarMonto(formatoSoles(totalEgresos), modoPrivacidad)}
        </strong>
        {mostrarComparativa && comparativaKpi && (
          <div>{renderDeltaPct(comparativaKpi.egresos_pct_delta, true)}</div>
        )}
        <span className="kpi-meta">
          {tituloPeriodo} ·{" "}
          <EditableText
            clave="kpiEgresosSub"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
      </article>

      <article className="kpi-card">
        <div className="kpi-card-top">
          <span className="kpi-title">
            <EditableText
              clave="kpiBalanceTitulo"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </span>
          <span
            className="kpi-icon-badge"
            style={{
              color: balanceColor,
              backgroundColor:
                balanceNeto >= 0
                  ? "rgba(56, 189, 248, 0.12)"
                  : "rgba(239, 68, 68, 0.12)",
              borderColor:
                balanceNeto >= 0
                  ? "rgba(56, 189, 248, 0.28)"
                  : "rgba(239, 68, 68, 0.28)",
            }}
            aria-hidden="true"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="M5 7h14" />
              <path d="M5 7l-2.5 6h5L5 7z" />
              <path d="M19 7l-2.5 6h5L19 7z" />
              <path d="M8 21h8" />
            </svg>
          </span>
        </div>
        <strong
          className={`kpi-value ${
            balanceNeto >= 0 ? "balance-pos" : "balance-neg"
          } ${modoPrivacidad ? "privacy-dots" : ""}`}
        >
          {mostrarMonto(formatoSoles(balanceNeto), modoPrivacidad)}
        </strong>
        {mostrarComparativa && comparativaKpi && (
          <div>
            <span
              className={`kpi-delta tabular-nums ${
                comparativaKpi.balance_diff >= 0 ? "amt-in" : "amt-out"
              }`}
            >
              {comparativaKpi.balance_diff >= 0 ? "▲ +" : "▼ "}
              {mostrarMonto(
                formatoSoles(comparativaKpi.balance_diff),
                modoPrivacidad
              )}{" "}
              vs periodo anterior
            </span>
          </div>
        )}
        <span className="kpi-meta">
          <EditableText
            clave="kpiBalanceSub"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
      </article>

      {mostrarCuartoKpi && topEgresoKpi && (
        <article className="kpi-card">
          <div className="kpi-card-top">
            <span
              className="kpi-title"
              style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
            >
              <span
                className="cat-color-dot"
                style={{ backgroundColor: topEgresoKpi.color }}
              />
              <EditableText
                clave="kpiTopEgresoTitulo"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </span>
            <span
              className="kpi-icon-badge"
              style={{
                color: topEgresoKpi.color,
                backgroundColor: `${topEgresoKpi.color}20`,
                borderColor: `${topEgresoKpi.color}45`,
              }}
              aria-hidden="true"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c.5 4-3 6-3 10a4 4 0 0 0 8 0c0-2.5-1.5-4.5-2-6-1.5 1.5-2 3-3 4 0-3 1-5.5 0-8z" />
              </svg>
            </span>
          </div>
          <strong
            className="kpi-value"
            style={{
              fontSize: "1.45rem",
              color: topEgresoKpi.color,
              lineHeight: 1.2,
            }}
          >
            {topEgresoKpi.categoria}
          </strong>
          <div
            className={`tabular-nums ${modoPrivacidad ? "privacy-dots" : ""}`}
            style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f87171" }}
          >
            {mostrarMonto(topEgresoKpi.monto_fmt, modoPrivacidad)} (
            {topEgresoKpi.porcentaje}%)
          </div>
          <span className="kpi-meta">
            {topEgresoKpi.cantidad} movimiento(s) en el periodo
          </span>
        </article>
      )}
    </section>
  );
}
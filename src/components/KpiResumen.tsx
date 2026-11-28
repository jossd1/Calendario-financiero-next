"use client";

import type { CSSProperties } from "react";
import EditableText from "@/components/EditableText";
import { formatoMoneda, mostrarMontoMoneda } from "@/lib/monedas";
import type { ComparativaKpiDTO, TextosUI, TopEgresoKpiDTO } from "@/types";

interface KpiResumenProps {
  tituloPeriodo: string;
  moneda: string;
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
  moneda,
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
  const balanceColor = balanceNeto >= 0 ? "var(--neutral-color)" : "var(--expense-color)";

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
              backgroundColor: "var(--income-soft)",
              borderColor: "rgba(16, 185, 129, 0.25)",
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
          {mostrarMontoMoneda(
            formatoMoneda(totalIngresos, moneda),
            modoPrivacidad,
            moneda
          )}
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
              backgroundColor: "var(--expense-soft)",
              borderColor: "rgba(239, 68, 68, 0.25)",
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
          {mostrarMontoMoneda(
            formatoMoneda(totalEgresos, moneda),
            modoPrivacidad,
            moneda
          )}
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
                  ? "var(--accent-soft)"
                  : "var(--expense-soft)",
              borderColor: "rgba(148, 163, 184, 0.25)",
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
          {mostrarMontoMoneda(
            formatoMoneda(balanceNeto, moneda),
            modoPrivacidad,
            moneda
          )}
        </strong>
        {mostrarComparativa && comparativaKpi && (
          <div>
            <span
              className={`kpi-delta tabular-nums ${
                comparativaKpi.balance_diff >= 0 ? "amt-in" : "amt-out"
              }`}
            >
              {comparativaKpi.balance_diff >= 0 ? "▲ +" : "▼ "}
              {mostrarMontoMoneda(
                formatoMoneda(comparativaKpi.balance_diff, moneda),
                modoPrivacidad,
                moneda
              )}{" "}
              vs periodo anterior
            </span>
          </div>
        )}
        <span className="kpi-meta">
          {tituloPeriodo} ·{" "}
          <EditableText
            clave="kpiBalanceSub"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
      </article>

      {mostrarCuartoKpi && topEgresoKpi && (
        <article
          className="kpi-card kpi-top-egreso-card"
          style={
            {
              "--kpi-top-accent": topEgresoKpi.color,
              "--kpi-cat-color": topEgresoKpi.color,
            } as CSSProperties
          }
        >
          <div className="kpi-card-top">
            <span
              className="kpi-title"
              style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
            >
              <span
                className="cat-color-dot kpi-top-dot"
                style={{ backgroundColor: "var(--kpi-cat-color)" }}
              />
              <EditableText
                clave="kpiTopEgresoTitulo"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </span>
            <span className="kpi-icon-badge kpi-top-badge" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c.5 4-3 6-3 10a4 4 0 0 0 8 0c0-2.5-1.5-4.5-2-6-1.5 1.5-2 3-3 4 0-3 1-5.5 0-8z" />
              </svg>
            </span>
          </div>
          <strong className="kpi-value kpi-top-cat-name">
            {topEgresoKpi.categoria}
          </strong>
          <div
            className={`tabular-nums kpi-top-amount ${
              modoPrivacidad ? "privacy-dots" : ""
            }`}
          >
            {mostrarMontoMoneda(topEgresoKpi.monto_fmt, modoPrivacidad, moneda)} (
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

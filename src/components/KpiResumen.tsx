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
        <span className="kpi-title">
          <EditableText
            clave="kpiIngresosTitulo"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
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
        <span className="kpi-title">
          <EditableText
            clave="kpiEgresosTitulo"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
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
        <span className="kpi-title">
          <EditableText
            clave="kpiBalanceTitulo"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </span>
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
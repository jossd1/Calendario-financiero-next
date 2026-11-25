"use client";

import { useMemo, useRef, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { analizarEntradaMonto } from "@/lib/atajos";
import { DIAS_SEMANA_ES, formatearFechaDMY } from "@/lib/format";
import { formatoMoneda, mostrarMontoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { AjustesAppConfig, DashboardEstadoDTO } from "@/types";

interface VistaSimpleWorkspaceProps {
  estado: DashboardEstadoDTO;
  diaSeleccionado: string;
  onSeleccionarDia: (fechaIso: string) => void;
  onMoverDiaFlecha: (delta: number) => void;
  onNavegarMes: (fechaIso: string) => Promise<void>;
  onCambiarPerfil: (perfilId: number) => Promise<void>;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
  onRefrescar: () => Promise<void>;
  onEliminarTx: (txId: number) => Promise<void>;
  onAbrirCategorias: () => void;
  onAbrirPapelera: () => void;
  onAbrirAjustes: () => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export default function VistaSimpleWorkspace({
  estado,
  diaSeleccionado,
  onSeleccionarDia,
  onMoverDiaFlecha,
  onNavegarMes,
  onCambiarPerfil,
  onActualizarConfig,
  onRefrescar,
  onEliminarTx,
  onAbrirCategorias,
  onAbrirPapelera,
  onAbrirAjustes,
  onNotificar,
  onToastSutil,
}: VistaSimpleWorkspaceProps) {
  const [montoTexto, setMontoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [diaFiltro, setDiaFiltro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const moneda = estado.perfil_actual.moneda;
  const monedaInfo = obtenerMonedaInfo(moneda);
  const { ajustes } = estado;
  const priv = ajustes.modoPrivacidad;
  const maskClass = priv ? "privacy-dots" : "";

  const analisis = useMemo(
    () => analizarEntradaMonto(montoTexto, estado.categorias),
    [montoTexto, estado.categorias]
  );

  const opcionesPerfiles = estado.perfiles.map((p) => {
    const m = obtenerMonedaInfo(p.moneda);
    return { value: String(p.id), label: p.nombre, hint: `${m.codigo} ${m.simbolo}` };
  });

  const visibles = useMemo(() => {
    if (!diaFiltro) return estado.transacciones_historial;
    return estado.transacciones_historial.filter((t) => t.fecha_iso === diaFiltro);
  }, [estado.transacciones_historial, diaFiltro]);

  const handlePickDay = (fechaIso: string) => {
    onSeleccionarDia(fechaIso);
    setDiaFiltro((prev) => (prev === fechaIso ? null : fechaIso));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (montoTexto.trim() !== "") return;
    if (e.key === "ArrowLeft") { e.preventDefault(); onMoverDiaFlecha(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); onMoverDiaFlecha(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); onMoverDiaFlecha(-7); }
    else if (e.key === "ArrowDown") { e.preventDefault(); onMoverDiaFlecha(7); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analisis || !analisis.monto || Number(analisis.monto) <= 0 || !analisis.cat) {
      setMontoTexto("");
      onToastSutil("Usa monto + atajo válido (ej. 15al).");
      inputRef.current?.focus();
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: analisis.cat.tipo,
          monto: analisis.monto,
          categoria: analisis.cat.nombre,
          descripcion: "",
          fecha: diaSeleccionado,
          estado: "pagado",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo registrar.");
        return;
      }
      setMontoTexto("");
      onNotificar("success", "Movimiento guardado.");
      await onRefrescar();
      inputRef.current?.focus();
    } catch {
      onNotificar("error", "Error de red al guardar.");
    } finally {
      setEnviando(false);
    }
  };

  const balGen = estado.balance_general_neto;

  return (
    <div className={`app-vista-simple ${ajustes.paletaSobria ? "theme-sobrio" : ""}`}>
      <div className="simple-shell">
        <header className="simple-topbar">
          <div className="simple-top-group">
            <span
              className="tabular-nums"
              title={`Moneda activa: ${monedaInfo.nombre}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "34px",
                height: "34px",
                padding: "0 8px",
                borderRadius: "10px",
                backgroundColor: "#141a29",
                color: "#f3f4f6",
                fontSize: "0.82rem",
                fontWeight: 700,
              }}
            >
              {monedaInfo.simbolo}
            </span>
            <span className="brand-title" style={{ fontSize: "1.05rem" }}>
              Calendario Financiero
            </span>
            <CustomSelect
              ariaLabel="Perfil activo"
              className="compact"
              value={String(estado.perfil_actual.id)}
              options={opcionesPerfiles}
              onChange={(val) => void onCambiarPerfil(Number(val))}
            />
            <div className="mode-dual">
              <button
                type="button"
                onClick={() => void onActualizarConfig({ paletaSobria: !ajustes.paletaSobria })}
                className={`mode-dual-btn ${ajustes.paletaSobria ? "is-active" : ""}`}
                title="Alternar paleta sobria"
                aria-label="Alternar paleta sobria"
              >
                ◐
              </button>
              <button
                type="button"
                onClick={() => void onActualizarConfig({ vistaSimple: false })}
                className="mode-dual-btn is-active"
                title="Volver a Vista Completa"
                aria-label="Volver a Vista Completa"
              >
                ◫
              </button>
            </div>
          </div>

          <div className="simple-top-group">
            <button type="button" onClick={onAbrirCategorias} className="simple-btn simple-btn-icon" title="Categorías" aria-label="Categorías">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>
            </button>
            <button type="button" onClick={onAbrirPapelera} className="simple-btn simple-btn-icon" title="Papelera" aria-label="Papelera">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
            <button
              type="button"
              onClick={() => void onActualizarConfig({ modoPrivacidad: !priv })}
              className={`simple-btn simple-btn-icon ${priv ? "is-active" : ""}`}
              title={priv ? "Mostrar montos" : "Ocultar montos"}
              aria-label="Ocultar montos"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button type="button" onClick={onAbrirAjustes} className="simple-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1 1.41 1.09H21a2 2 0 0 1 0 4h-.09c-.64.09-1.15.49-1.51 1z"/></svg>
              <span>Ajustes</span>
            </button>
          </div>
        </header>

        <section className="simple-kpis">
          <article className="simple-card" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
              <span>Ingresos del mes</span><span className="amt-in">Entradas</span>
            </div>
            <strong className={`tabular-nums amt-in ${maskClass}`} style={{ fontSize: "1.55rem", fontWeight: 700 }}>
              {mostrarMontoMoneda(formatoMoneda(estado.total_ingresos, moneda), priv, moneda, "+ ")}
            </strong>
            <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>{estado.titulo_periodo}</span>
          </article>

          <article className="simple-card" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
              <span>Egresos del mes</span><span className="amt-out">Salidas</span>
            </div>
            <strong className={`tabular-nums amt-out ${maskClass}`} style={{ fontSize: "1.55rem", fontWeight: 700 }}>
              {mostrarMontoMoneda(formatoMoneda(estado.total_egresos, moneda), priv, moneda, "- ")}
            </strong>
            <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>{estado.titulo_periodo}</span>
          </article>

          <article className="simple-card" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
              <span>Balance Neto General</span><span style={{ color: "#6b7280" }}>Neto</span>
            </div>
            <strong className={`tabular-nums ${balGen >= 0 ? "amt-in" : "amt-out"} ${maskClass}`} style={{ fontSize: "1.55rem", fontWeight: 700 }}>
              {mostrarMontoMoneda(formatoMoneda(balGen, moneda), priv, moneda)}
            </strong>
            <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>Disponible histórico de tu perfil</span>
          </article>
        </section>

        <section className="simple-grid">
          <div className="simple-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1.02rem" }}>{estado.titulo_periodo}</strong>
              <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" className="simple-btn simple-btn-icon" onClick={() => void onNavegarMes(estado.fecha_anterior)} title="Mes anterior" aria-label="Mes anterior">
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="12,1 2,6 12,11" /></svg>
                </button>
                <button type="button" className="simple-btn" onClick={() => { onSeleccionarDia(estado.hoy_iso); setDiaFiltro(estado.hoy_iso); void onNavegarMes(estado.hoy_iso); }}>Hoy</button>
                <button type="button" className="simple-btn simple-btn-icon" onClick={() => void onNavegarMes(estado.fecha_siguiente)} title="Mes siguiente" aria-label="Mes siguiente">
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="2,1 12,6 2,11" /></svg>
                </button>
              </div>
            </div>

            <div className="simple-weekdays">
              {DIAS_SEMANA_ES.map((d) => <div key={d} className="simple-wd">{d}</div>)}
            </div>

            <div className="simple-days">
              {(estado.semanas_calendario ?? []).flat().map((c) => {
                const cls = [
                  "simple-day",
                  !c.es_mes_actual ? "outside" : "",
                  c.es_hoy ? "is-today" : "",
                  c.fecha_iso === diaSeleccionado ? "is-selected" : "",
                ].filter(Boolean).join(" ");
                return (
                  <button key={c.fecha_iso} type="button" className={cls} onClick={() => handlePickDay(c.fecha_iso)}>
                    <span className="simple-dnum">{c.dia}</span>
                    {c.cantidad > 0 && <span className="simple-dmov">{c.cantidad} mov.</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <form onSubmit={handleSubmit} className="simple-card simple-register-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ fontSize: "0.96rem" }}>Registrar movimiento</strong>
                <span className="tabular-nums" style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                  {formatearFechaDMY(diaSeleccionado)}
                </span>
              </div>
              <label htmlFor="simple-monto" style={{ display: "block", fontSize: "0.78rem", color: "#9ca3af", marginBottom: "6px", fontWeight: 600 }}>
                Monto y atajo
              </label>
              <input
                ref={inputRef}
                id="simple-monto"
                type="text"
                autoComplete="off"
                placeholder="0.00"
                value={montoTexto}
                onChange={(e) => setMontoTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                className="simple-input tabular-nums"
                required
              />
              {analisis && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    color: analisis.cat
                      ? analisis.cat.tipo === "ingreso"
                        ? "var(--income-color)"
                        : "var(--expense-color)"
                      : "#fbbf24",
                  }}
                >
                  {analisis.cat
                    ? `⚡ [${analisis.cat.atajo}] → ${analisis.cat.nombre} (${analisis.cat.tipo === "ingreso" ? "Ingreso" : "Egreso"})`
                    : "Incluye un atajo válido (ej. 15al)."}
                </div>
              )}
              <button type="submit" disabled={enviando} className="simple-save-btn">
                {enviando ? "Guardando..." : "Guardar movimiento"}
              </button>
            </form>

            <div className="simple-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "0.92rem" }}>
                  {diaFiltro ? `Movimientos del ${formatearFechaDMY(diaFiltro)}` : `Movimientos de ${estado.titulo_periodo}`}
                </strong>
                {diaFiltro && (
                  <button type="button" className="simple-btn" style={{ padding: "3px 9px", fontSize: "0.74rem" }} onClick={() => setDiaFiltro(null)}>
                    Ver todo el mes ×
                  </button>
                )}
              </div>

              <div className="simple-mov-list">
                {visibles.length > 0 ? (
                  visibles.map((t) => (
                    <div key={t.id} className="simple-mov-item">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.descripcion || t.categoria}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          {t.fecha_fmt.slice(0, 5)} · {t.categoria}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`tabular-nums ${t.tipo === "ingreso" ? "amt-in" : "amt-out"} ${maskClass}`} style={{ fontWeight: 600 }}>
                          {mostrarMontoMoneda(t.monto_fmt, priv, moneda, t.tipo === "ingreso" ? "+" : "-")}
                        </span>
                        <button type="button" className="simple-del-btn" onClick={() => void onEliminarTx(t.id)} title="Eliminar">
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "#6b7280", padding: "18px 0", fontSize: "0.84rem" }}>
                    Sin movimientos registrados.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
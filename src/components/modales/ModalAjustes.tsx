"use client";

import { useEffect, useState } from "react";
import {
  AjustesActionRow,
  AjustesCard,
  AjustesToggleRow,
} from "@/components/modales/AjustesControles";
import type { AjustesAppConfig, CategoriaDTO } from "@/types";

type SeccionAjustes =
  | "general"
  | "apariencia"
  | "privacidad"
  | "modulos"
  | "datos";

interface ModalAjustesProps {
  abierto: boolean;
  ajustes: AjustesAppConfig;
  categorias: CategoriaDTO[];
  editModeTextos: boolean;
  onCerrar: () => void;
  onToggleEditModeTextos: () => void;
  onRestablecerTextos: () => Promise<void>;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
  onActivarPin?: (pin: string) => Promise<boolean>;
  onDesactivarPin?: () => Promise<void>;
}

const SECCIONES: ReadonlyArray<{ id: SeccionAjustes; icono: string; label: string }> = [
  { id: "general", icono: "🎛️", label: "General" },
  { id: "apariencia", icono: "🎨", label: "Apariencia" },
  { id: "privacidad", icono: "🔒", label: "Privacidad" },
  { id: "modulos", icono: "🧩", label: "Módulos" },
  { id: "datos", icono: "💾", label: "Datos" },
];

export default function ModalAjustes({
  abierto,
  ajustes,
  categorias,
  editModeTextos,
  onCerrar,
  onToggleEditModeTextos,
  onRestablecerTextos,
  onActualizarConfig,
  onActivarPin,
  onDesactivarPin,
}: ModalAjustesProps) {
  const [seccion, setSeccion] = useState<SeccionAjustes>("general");
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  const [panelPinAbierto, setPanelPinAbierto] = useState(false);
  const [pinValor, setPinValor] = useState("");
  const [pinError, setPinError] = useState("");
  const [guardandoPin, setGuardandoPin] = useState(false);

  useEffect(() => {
    if (!confirmandoReset) return;
    const timer = setTimeout(() => setConfirmandoReset(false), 3500);
    return () => clearTimeout(timer);
  }, [confirmandoReset]);

  useEffect(() => {
    if (!abierto) {
      setConfirmandoReset(false);
      setPanelPinAbierto(false);
      setPinValor("");
      setPinError("");
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleTogglePin = async (quiereActivar: boolean) => {
    if (!quiereActivar) {
      setPanelPinAbierto(false);
      setPinValor("");
      setPinError("");
      if (onDesactivarPin) await onDesactivarPin();
      else await onActualizarConfig({ authPinActivo: false });
      return;
    }
    setPinError("");
    setPinValor("");
    setPanelPinAbierto(true);
  };

  const handleGuardarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = pinValor.trim();
    if (!/^\d{4,6}$/.test(limpio)) {
      setPinError("Ingresa un PIN numérico de 4 a 6 dígitos.");
      return;
    }
    if (!onActivarPin) {
      setPinError("El motor de bloqueo por PIN se habilita en la Etapa 3.");
      return;
    }
    setGuardandoPin(true);
    setPinError("");
    const ok = await onActivarPin(limpio);
    setGuardandoPin(false);
    if (ok) {
      setPanelPinAbierto(false);
      setPinValor("");
    } else {
      setPinError("No se pudo guardar el PIN.");
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div
        className="modal-flotante"
        style={{ maxWidth: "820px", width: "94%" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="settings-shell">
          <div className="settings-header">
            <div>
              <h3 className="panel-title">⚙️ Ajustes y Personalización</h3>
              <p className="settings-row-desc">
                Activa módulos opcionales, edita textos en pantalla o configura seguridad.
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="btn btn-secondary btn-sm"
            >
              ✕
            </button>
          </div>

          <div className="settings-body">
            <aside className="settings-sidebar">
              {SECCIONES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeccion(s.id)}
                  className={`settings-nav-btn ${
                    seccion === s.id ? "active" : ""
                  }`}
                >
                  <span>{s.icono}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </aside>

            <div className="settings-content">
              {seccion === "general" && (
                <>
                  <AjustesCard titulo="Edición de Textos en Pantalla">
                    <AjustesActionRow
                      titulo="Modo Edición en Vivo"
                      descripcion="Edita cualquier título o etiqueta con un clic (acepta vacío y soporta Ctrl+Z)."
                    >
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          editModeTextos ? "btn-secondary" : "btn-primary"
                        }`}
                        onClick={() => {
                          onToggleEditModeTextos();
                          if (!editModeTextos) onCerrar();
                        }}
                      >
                        {editModeTextos ? "Salir de Edición" : "✏️ Activar"}
                      </button>
                    </AjustesActionRow>

                    <AjustesActionRow
                      titulo="Restablecer Textos Originales"
                      descripcion="Devuelve todos los títulos y etiquetas a su texto de fábrica."
                    >
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          confirmandoReset ? "btn-danger-armed" : "btn-danger"
                        }`}
                        onClick={() => {
                          if (!confirmandoReset) {
                            setConfirmandoReset(true);
                            return;
                          }
                          setConfirmandoReset(false);
                          void onRestablecerTextos();
                        }}
                      >
                        {confirmandoReset ? "⚠️ ¿Confirmar?" : "↺ Restablecer"}
                      </button>
                    </AjustesActionRow>
                  </AjustesCard>

                  <AjustesCard titulo="Comportamiento Rápido">
                    <AjustesActionRow
                      titulo="Categoría Predeterminada"
                      descripcion="Categoría seleccionada inicialmente en el registro rápido."
                    >
                      <select
                        value={ajustes.categoriaPredeterminada}
                        onChange={(e) =>
                          void onActualizarConfig({
                            categoriaPredeterminada: e.target.value,
                          })
                        }
                        className="input-control"
                        style={{ width: "170px", padding: "6px 10px", fontSize: "0.82rem" }}
                      >
                        <option value="">Automática (primera)</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </AjustesActionRow>

                    <AjustesActionRow
                      titulo="Densidad Visual"
                      descripcion="Espaciado de celdas y filas en el dashboard."
                    >
                      <select
                        value={ajustes.densidad}
                        onChange={(e) =>
                          void onActualizarConfig({
                            densidad: e.target.value as "comoda" | "compacta",
                          })
                        }
                        className="input-control"
                        style={{ width: "130px", padding: "6px 10px", fontSize: "0.82rem" }}
                      >
                        <option value="comoda">Cómoda</option>
                        <option value="compacta">Compacta</option>
                      </select>
                    </AjustesActionRow>
                  </AjustesCard>
                </>
              )}

              {seccion === "apariencia" && (
                <AjustesCard titulo="Vistas y Tarjetas KPI">
                  <AjustesToggleRow
                    titulo="4to KPI: Categoría Top Egreso"
                    descripcion="Muestra la categoría con mayor gasto del periodo (se oculta si no hay egresos)."
                    badge="Activo"
                    checked={ajustes.kpiTopEgreso}
                    onChange={(v) => void onActualizarConfig({ kpiTopEgreso: v })}
                  />
                  <AjustesToggleRow
                    titulo="Indicadores Comparativos en KPIs"
                    descripcion="Muestra variación porcentual y diferencia respecto al periodo anterior."
                    badge="Activo"
                    checked={ajustes.comparativasKpi}
                    onChange={(v) =>
                      void onActualizarConfig({ comparativasKpi: v })
                    }
                  />
                  <AjustesToggleRow
                    titulo="Vista Semanal (Semana)"
                    descripcion="Agrega la pestaña Semana en la barra de vistas."
                    badge="Activo"
                    checked={ajustes.vistaSemanal}
                    onChange={(v) => void onActualizarConfig({ vistaSemanal: v })}
                  />
                  <AjustesToggleRow
                    titulo="Vista General Histórica"
                    descripcion="Habilita el botón 🌐 General con resumen histórico total."
                    badge="Activo"
                    checked={ajustes.vistaGeneral}
                    onChange={(v) => void onActualizarConfig({ vistaGeneral: v })}
                  />
                  <AjustesToggleRow
                    titulo="Hover Preview en Días"
                    descripcion="Muestra un resumen flotante al pasar el cursor por un día."
                    badge="Activo"
                    checked={ajustes.hoverPreviewDia}
                    onChange={(v) =>
                      void onActualizarConfig({ hoverPreviewDia: v })
                    }
                  />
                  <AjustesToggleRow
                    titulo="Mostrar Neto Diario en Celdas"
                    descripcion="Muestra una tercera línea con el balance neto en cada día del mes."
                    badge="Activo"
                    checked={ajustes.mostrarNetoCeldas}
                    onChange={(v) =>
                      void onActualizarConfig({ mostrarNetoCeldas: v })
                    }
                  />
                    <AjustesActionRow
                                titulo="Alerta de Tope Diario (S/)"
                                descripcion="Resalta en ámbar los días cuyo egreso supere este monto (0 = desactivado)."
                                >
                                <input
                                    type="number"
                                    min={0}
                                    step={10}
                                    value={ajustes.alertaTopeDiario}
                                    onChange={(e) =>
                                    void onActualizarConfig({
                                        alertaTopeDiario: Math.max(0, Number(e.target.value) || 0),
                                    })
                                    }
                                    className="input-control tabular-nums"
                                    style={{ width: "110px", padding: "6px 10px", fontSize: "0.82rem" }}
                                />
                        </AjustesActionRow>

                </AjustesCard>
              )}

              {seccion === "privacidad" && (
                <AjustesCard titulo="Privacidad y Acceso Local">
                  <AjustesToggleRow
                    titulo="Modo Privacidad (S/ •••)"
                    descripcion="Oculta los montos en pantalla reemplazándolos por puntos limpios."
                    badge="Activo"
                    checked={ajustes.modoPrivacidad}
                    onChange={(v) =>
                      void onActualizarConfig({ modoPrivacidad: v })
                    }
                  />

                  <div>
                    <AjustesToggleRow
                      titulo="Bloqueo por PIN Numérico"
                      descripcion="Solicita un PIN de 4 a 6 dígitos al abrir la app (opcional)."
                      badge="Etapa 3"
                      badgeTone="proximo"
                      checked={ajustes.authPinActivo || panelPinAbierto}
                      onChange={(v) => void handleTogglePin(v)}
                    />

                    {panelPinAbierto && !ajustes.authPinActivo && (
                      <form onSubmit={handleGuardarPin} className="settings-pin-drawer">
                        <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          Define tu PIN (4 a 6 dígitos). Si cancelas o lo dejas vacío, no se activará:
                        </label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pinValor}
                            onChange={(e) =>
                              setPinValor(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Ej. 1234"
                            className="input-control tabular-nums"
                            style={{ width: "160px", padding: "6px 10px" }}
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={guardandoPin}
                            className="btn btn-primary btn-sm"
                          >
                            {guardandoPin ? "Guardando..." : "Activar PIN"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setPanelPinAbierto(false);
                              setPinValor("");
                              setPinError("");
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                        {pinError && (
                          <span style={{ fontSize: "0.76rem", color: "var(--range-end-color)" }}>
                            {pinError}
                          </span>
                        )}
                      </form>
                    )}
                  </div>
                </AjustesCard>
              )}

              {seccion === "modulos" && (
                <AjustesCard titulo="Herramientas Financieras Opcionales">
                  <AjustesToggleRow
                    titulo="Presupuestos Mensuales por Categoría"
                    descripcion="Límites de gasto mensual con barras de progreso y alertas."
                    badge="Etapa 4"
                    badgeTone="proximo"
                    checked={ajustes.presupuestosActivos}
                    onChange={(v) =>
                      void onActualizarConfig({ presupuestosActivos: v })
                    }
                  />
                  <AjustesToggleRow
                    titulo="Pagos Programados y Recurrentes"
                    descripcion="Control de movimientos pagados, pendientes y programados."
                    badge="Etapa 4"
                    badgeTone="proximo"
                    checked={ajustes.programadosActivos}
                    onChange={(v) =>
                      void onActualizarConfig({ programadosActivos: v })
                    }
                  />
                    <AjustesToggleRow
                                    titulo="Vista General: Ahorro y Promedios"
                                    descripcion="Muestra Tasa de Ahorro Global y promedios mensuales en General."
                                    badge="Activo"
                                    checked={ajustes.generalMostrarAhorro}
                                    onChange={(v) =>
                                        void onActualizarConfig({ generalMostrarAhorro: v })
                                    }
                                    />
                                    <AjustesToggleRow
                                    titulo="Vista General: Gráfico de Evolución"
                                    descripcion="Gráfico histórico de saldo acumulado y ahorro neto mes a mes."
                                    badge="Activo"
                                    checked={ajustes.generalMostrarEvolucion}
                                    onChange={(v) =>
                                        void onActualizarConfig({ generalMostrarEvolucion: v })
                                    }
                                    />
                                    <AjustesToggleRow
                                    titulo="Vista General: Récords y Top Categorías"
                                    descripcion="Muestra mejor mes, mes con mayor gasto y Top 5 categorías históricas."
                                    badge="Activo"
                                    checked={ajustes.generalMostrarRecords}
                                    onChange={(v) =>
                                        void onActualizarConfig({ generalMostrarRecords: v })
                                    }
                                    />
                                    <AjustesToggleRow
                                    titulo="Vista General: Comparativa Año vs Año"
                                    descripcion="Tabla resumen comparando todos tus años registrados."
                                    badge="Activo"
                                    checked={ajustes.generalMostrarAnual}
                                    onChange={(v) =>
                                        void onActualizarConfig({ generalMostrarAnual: v })
                                    }
                                    />
                                    <AjustesToggleRow
                                    titulo="Vista General: Permitir Consolidado Multi-Perfil"
                                    descripcion="Habilita el selector para ver el total sumado de todos tus perfiles."
                                    badge="Activo"
                                    checked={ajustes.generalPermitirConsolidado}
                                    onChange={(v) =>
                                        void onActualizarConfig({ generalPermitirConsolidado: v })
                                    }
                            />
                </AjustesCard>
              )}

              {seccion === "datos" && (
                <AjustesCard titulo="Exportación y Respaldo">
                  <AjustesActionRow
                    titulo="Exportar Historial en CSV"
                    descripcion="Descarga todos los movimientos activos del perfil en formato compatible con Excel."
                  >
                    <a
                      href="/api/exportar/csv"
                      className="btn btn-secondary btn-sm"
                    >
                      ⬇ Descargar .CSV
                    </a>
                  </AjustesActionRow>
                  <AjustesActionRow
                    titulo="Backup Completo en JSON"
                    descripcion="Copia de seguridad integral (disponible en Etapa 4)."
                  >
                    <span style={{ fontSize: "0.76rem", color: "var(--neutral-color)", fontWeight: 600 }}>
                      Próximamente (Etapa 4)
                    </span>
                  </AjustesActionRow>
                </AjustesCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
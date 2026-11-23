"use client";

import { useEffect, useState } from "react";
import SeccionApariencia from "@/components/modales/ajustes/SeccionApariencia";
import SeccionDatos from "@/components/modales/ajustes/SeccionDatos";
import SeccionGeneral from "@/components/modales/ajustes/SeccionGeneral";
import SeccionModulos from "@/components/modales/ajustes/SeccionModulos";
import SeccionPrivacidad from "@/components/modales/ajustes/SeccionPrivacidad";
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
  moneda: string;
  editModeTextos: boolean;
  onCerrar: () => void;
  onToggleEditModeTextos: () => void;
  onRestablecerTextos: () => Promise<void>;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
  onActivarPin?: (pin: string) => Promise<boolean>;
  onDesactivarPin?: () => Promise<void>;
  onImportado?: () => Promise<void>;
  onNotificar?: (tipo: "success" | "error", texto: string) => void;
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
  moneda,
  editModeTextos,
  onCerrar,
  onToggleEditModeTextos,
  onRestablecerTextos,
  onActualizarConfig,
  onActivarPin,
  onDesactivarPin,
  onImportado,
  onNotificar,
}: ModalAjustesProps) {
  const [seccion, setSeccion] = useState<SeccionAjustes>("general");
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  useEffect(() => {
    if (!confirmandoReset) return;
    const timer = setTimeout(() => setConfirmandoReset(false), 3500);
    return () => clearTimeout(timer);
  }, [confirmandoReset]);

  useEffect(() => {
    if (!abierto) {
      setConfirmandoReset(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

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
            <button type="button" onClick={onCerrar} className="btn btn-secondary btn-sm">
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
                  className={`settings-nav-btn ${seccion === s.id ? "active" : ""}`}
                >
                  <span>{s.icono}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </aside>

            <div className="settings-content">
              {seccion === "general" && (
                <SeccionGeneral
                  ajustes={ajustes}
                  categorias={categorias}
                  editModeTextos={editModeTextos}
                  confirmandoReset={confirmandoReset}
                  onToggleEditModeTextos={onToggleEditModeTextos}
                  onCerrarModal={onCerrar}
                  onPedirConfirmarReset={() => setConfirmandoReset(true)}
                  onEjecutarReset={async () => {
                    setConfirmandoReset(false);
                    await onRestablecerTextos();
                  }}
                  onActualizarConfig={onActualizarConfig}
                />
              )}

              {seccion === "apariencia" && (
                <SeccionApariencia
                  ajustes={ajustes}
                  moneda={moneda}
                  onActualizarConfig={onActualizarConfig}
                />
              )}

              {seccion === "privacidad" && (
                <SeccionPrivacidad
                  ajustes={ajustes}
                  onActualizarConfig={onActualizarConfig}
                  onActivarPin={onActivarPin}
                  onDesactivarPin={onDesactivarPin}
                />
              )}

              {seccion === "modulos" && (
                <SeccionModulos
                  ajustes={ajustes}
                  onActualizarConfig={onActualizarConfig}
                />
              )}

              {seccion === "datos" && (
                <SeccionDatos
                  onImportado={onImportado}
                  onNotificar={onNotificar}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
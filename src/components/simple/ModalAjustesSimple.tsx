"use client";

import { useEffect } from "react";
import type { AjustesAppConfig } from "@/types";

interface ModalAjustesSimpleProps {
  abierto: boolean;
  ajustes: AjustesAppConfig;
  onCerrar: () => void;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
}

export default function ModalAjustesSimple({
  abierto,
  ajustes,
  onCerrar,
  onActualizarConfig,
}: ModalAjustesSimpleProps) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" style={{ maxWidth: "460px" }} role="dialog" aria-modal="true">
        <div className="simple-card" style={{ padding: "20px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <strong style={{ fontSize: "1rem" }}>Ajustes</strong>
            <button type="button" className="simple-btn" onClick={onCerrar}>✕</button>
          </div>

          <div
            style={{
              backgroundColor: "#111622",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "11px",
              overflow: "hidden",
            }}
          >
            <div
              className="settings-row clickable"
              onClick={() =>
                void onActualizarConfig({ modoPrivacidad: !ajustes.modoPrivacidad })
              }
            >
              <div>
                <div className="settings-row-title">Ocultar montos</div>
                <p className="settings-row-desc">Enmascara cifras en pantalla</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={ajustes.modoPrivacidad}
                className={`settings-switch ${ajustes.modoPrivacidad ? "on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void onActualizarConfig({ modoPrivacidad: !ajustes.modoPrivacidad });
                }}
              >
                <span className="settings-switch-thumb" />
              </button>
            </div>

            <div
              className="settings-row clickable"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() =>
                void onActualizarConfig({ paletaSobria: !ajustes.paletaSobria })
              }
            >
              <div>
                <div className="settings-row-title">Paleta sobria oscura</div>
                <p className="settings-row-desc">Tono más suave para la vista</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={ajustes.paletaSobria}
                className={`settings-switch ${ajustes.paletaSobria ? "on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void onActualizarConfig({ paletaSobria: !ajustes.paletaSobria });
                }}
              >
                <span className="settings-switch-thumb" />
              </button>
            </div>

            <div
              className="settings-row"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <div className="settings-row-title">Respaldar mis datos</div>
                <p className="settings-row-desc">Descarga rápida en .CSV o .JSON</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <a href="/api/exportar/csv" className="simple-btn">.CSV</a>
                <a href="/api/exportar/json" className="simple-btn">.JSON</a>
              </div>
            </div>

            <div
              className="settings-row"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <div className="settings-row-title">Vista Completa</div>
                <p className="settings-row-desc">Activa análisis, gráficos y presupuestos</p>
              </div>
              <button
                type="button"
                className="simple-btn"
                onClick={() => {
                  onCerrar();
                  void onActualizarConfig({ vistaSimple: false });
                }}
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState } from "react";
import {
  AjustesCard,
  AjustesToggleRow,
} from "@/components/modales/AjustesControles";
import type { AjustesAppConfig } from "@/types";

interface SeccionPrivacidadProps {
  ajustes: AjustesAppConfig;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
  onActivarPin?: (pin: string) => Promise<boolean>;
  onDesactivarPin?: () => Promise<void>;
}

export default function SeccionPrivacidad({
  ajustes,
  onActualizarConfig,
  onActivarPin,
  onDesactivarPin,
}: SeccionPrivacidadProps) {
  const [panelPinAbierto, setPanelPinAbierto] = useState(false);
  const [pinValor, setPinValor] = useState("");
  const [pinError, setPinError] = useState("");
  const [guardandoPin, setGuardandoPin] = useState(false);

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
      setPinError("Servicio de PIN no disponible.");
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
    <AjustesCard titulo="Privacidad y Acceso Local">
      <AjustesToggleRow
        titulo="Modo Privacidad (S/ •••)"
        descripcion="Oculta los montos en pantalla reemplazándolos por puntos centrados."
        badge="Activo"
        checked={ajustes.modoPrivacidad}
        onChange={(v) => void onActualizarConfig({ modoPrivacidad: v })}
      />

      <div>
        <AjustesToggleRow
          titulo="Bloqueo por PIN Numérico"
          descripcion="Solicita un PIN de 4 a 6 dígitos al abrir la app (opcional)."
          badge="Activo"
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
                onChange={(e) => setPinValor(e.target.value.replace(/\D/g, ""))}
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
  );
}
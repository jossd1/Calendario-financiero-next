"use client";

import type { ReactNode } from "react";

interface AjustesCardProps {
  titulo?: string;
  children: ReactNode;
}

export function AjustesCard({ titulo, children }: AjustesCardProps) {
  return (
    <div>
      {titulo && <h4 className="settings-group-title">{titulo}</h4>}
      <div className="settings-card">{children}</div>
    </div>
  );
}

interface AjustesToggleRowProps {
  titulo: string;
  descripcion: string;
  badge?: string;
  badgeTone?: "activo" | "proximo";
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AjustesToggleRow({
  titulo,
  descripcion,
  badge,
  badgeTone = "activo",
  checked,
  onChange,
}: AjustesToggleRowProps) {
  return (
    <div
      className="settings-row clickable"
      onClick={() => onChange(!checked)}
    >
      <div className="settings-row-info">
        <div className="settings-row-title">
          <span>{titulo}</span>
          {badge && (
            <span className={`settings-badge ${badgeTone}`}>{badge}</span>
          )}
        </div>
        <p className="settings-row-desc">{descripcion}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        className={`settings-switch ${checked ? "on" : ""}`}
      >
        <span className="settings-switch-thumb" />
      </button>
    </div>
  );
}

interface AjustesActionRowProps {
  titulo: string;
  descripcion: string;
  children: ReactNode;
}

export function AjustesActionRow({
  titulo,
  descripcion,
  children,
}: AjustesActionRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-title">{titulo}</div>
        <p className="settings-row-desc">{descripcion}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}
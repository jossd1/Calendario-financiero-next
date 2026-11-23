"use client";

import type { FlashMensaje } from "@/types";

interface FlashFloatingStackProps {
  flashes: FlashMensaje[];
  onCerrar: (id: string) => void;
}

export default function FlashFloatingStack({
  flashes,
  onCerrar,
}: FlashFloatingStackProps) {
  if (flashes.length === 0) return null;

  return (
    <div className="flash-floating-stack" aria-live="polite">
      {flashes.map((f, idx) => (
        <div
          key={f.id}
          className={`flash-item flash-${f.tipo} ${
            idx === 0 ? "is-latest" : "is-previous"
          }`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {idx === 0 && flashes.length > 1 && (
              <span className="flash-recent-pill">Reciente</span>
            )}
            <span>{f.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => onCerrar(f.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

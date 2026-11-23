"use client";

import { useEffect, useRef, useState } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  color?: string;
  grupo?: string;
  hint?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuAlign?: "left" | "right";
  menuDirection?: "down" | "up";
}

export default function CustomSelect({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = "Seleccionar...",
  className = "",
  triggerClassName = "",
  menuAlign = "left",
  menuDirection = "down",
}: CustomSelectProps) {
  const [abierto, setAbierto] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const seleccionada = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!abierto) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  return (
    <div ref={rootRef} className={`custom-select ${className}`.trim()}>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={abierto}
        aria-haspopup="listbox"
        onClick={() => setAbierto((v) => !v)}
        className={`custom-select-trigger ${abierto ? "is-open" : ""} ${triggerClassName}`.trim()}
      >
        <span className="custom-select-value">
          {seleccionada?.color && (
            <span
              className="cat-color-dot"
              style={{ backgroundColor: seleccionada.color }}
            />
          )}
          <span className="custom-select-label">
            {seleccionada ? seleccionada.label : placeholder}
          </span>
        </span>
        <span className="custom-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {abierto && (
        <div
          role="listbox"
          className={`custom-select-menu ${
            menuAlign === "right" ? "align-right" : ""
          } ${menuDirection === "up" ? "open-up" : ""}`.trim()}
        >
          {options.map((opt, idx) => {
            const prevGrupo = idx > 0 ? options[idx - 1].grupo : undefined;
            const mostrarGrupo = opt.grupo && opt.grupo !== prevGrupo;
            const activa = opt.value === value;

            return (
              <div key={`${opt.grupo ?? "g"}-${opt.value}-${idx}`}>
                {mostrarGrupo && (
                  <div className="custom-select-group">{opt.grupo}</div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={activa}
                  onClick={() => {
                    onChange(opt.value);
                    setAbierto(false);
                  }}
                  className={`custom-select-option ${activa ? "is-active" : ""}`}
                >
                  <span className="custom-select-option-left">
                    {opt.color && (
                      <span
                        className="cat-color-dot"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </span>
                  <span className="custom-select-option-right">
                    {opt.hint && (
                      <span className="custom-select-hint">{opt.hint}</span>
                    )}
                    {activa && <span className="custom-select-check">✓</span>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
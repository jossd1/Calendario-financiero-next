"use client";

import { useEffect, useRef, useState } from "react";
import type { TextosUI } from "@/types";

interface EditableTextProps {
  clave: string;
  textos: TextosUI;
  editMode: boolean;
  onGuardarTexto: (clave: string, nuevoValor: string) => void;
}

export default function EditableText({
  clave,
  textos,
  editMode,
  onGuardarTexto,
}: EditableTextProps) {
  const valorActual = textos[clave] ?? "";
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(valorActual);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setBorrador(valorActual);
  }, [valorActual]);

  useEffect(() => {
    if (!editMode) {
      setEditando(false);
    }
  }, [editMode]);

  useEffect(() => {
    if (editando) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editando]);

  if (!editMode) {
    if (!valorActual) return null;
    return <>{valorActual}</>;
  }

  const confirmar = () => {
    onGuardarTexto(clave, borrador);
    setEditando(false);
  };

  const cancelar = () => {
    setBorrador(valorActual);
    setEditando(false);
  };

  if (editando) {
    return (
      <span
        className="editable-inline-editor"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              confirmar();
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              cancelar();
            }
          }}
          placeholder="Dejar vacío..."
          className="editable-inline-input"
        />
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            confirmar();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              confirmar();
            }
          }}
          className="btn btn-primary btn-sm"
          style={{ padding: "2px 7px", fontSize: "0.75rem" }}
          title="Aceptar"
        >
          ✓
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelar();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              cancelar();
            }
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: "2px 7px", fontSize: "0.75rem" }}
          title="Cancelar"
        >
          ✕
        </span>
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className="editable-active-target"
      title="Clic para editar este texto (puede quedar vacío)"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBorrador(valorActual);
        setEditando(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setBorrador(valorActual);
          setEditando(true);
        }
      }}
    >
      {valorActual ? (
        valorActual
      ) : (
        <span className="editable-empty-pill">[vacío]</span>
      )}
    </span>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import type { TextosUI } from "@/types";

interface UseEditModeTextosParams {
  textos: TextosUI;
  onActualizarTextosEnEstado: (nuevos: TextosUI) => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export function useEditModeTextos({
  textos,
  onActualizarTextosEnEstado,
  onNotificar,
  onToastSutil,
}: UseEditModeTextosParams) {
  const [editModeTextos, setEditModeTextos] = useState(false);
  const [undoStack, setUndoStack] = useState<TextosUI[]>([]);
  const [redoStack, setRedoStack] = useState<TextosUI[]>([]);

  const persistirTextos = useCallback(
    async (nuevosTextos: TextosUI) => {
      try {
        const res = await fetch("/api/ajustes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ textos: nuevosTextos }),
        });
        const data = await res.json();
        if (data.ok && data.textos) {
          onActualizarTextosEnEstado(data.textos as TextosUI);
        }
      } catch {
        onToastSutil("No se pudo guardar el texto en la base de datos.");
      }
    },
    [onActualizarTextosEnEstado, onToastSutil]
  );

  const handleGuardarTexto = useCallback(
    (clave: string, nuevoValor: string) => {
      if ((textos[clave] ?? "") === nuevoValor) return;
      const actualizados: TextosUI = { ...textos, [clave]: nuevoValor };
      setUndoStack((prev) => [...prev, textos]);
      setRedoStack([]);
      onActualizarTextosEnEstado(actualizados);
      void persistirTextos(actualizados);
    },
    [textos, onActualizarTextosEnEstado, persistirTextos]
  );

  const handleDeshacerTexto = useCallback(() => {
    if (undoStack.length === 0) return;
    const anterior = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, textos]);
    onActualizarTextosEnEstado(anterior);
    void persistirTextos(anterior);
  }, [undoStack, textos, onActualizarTextosEnEstado, persistirTextos]);

  const handleRehacerTexto = useCallback(() => {
    if (redoStack.length === 0) return;
    const siguiente = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, textos]);
    onActualizarTextosEnEstado(siguiente);
    void persistirTextos(siguiente);
  }, [redoStack, textos, onActualizarTextosEnEstado, persistirTextos]);

  const handleRestablecerTextos = useCallback(async () => {
    try {
      const res = await fetch("/api/ajustes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restablecerTextos: true }),
      });
      const data = await res.json();
      if (data.ok && data.textos) {
        setUndoStack((prev) => [...prev, textos]);
        setRedoStack([]);
        onActualizarTextosEnEstado(data.textos as TextosUI);
        onToastSutil("Textos originales restablecidos.");
      }
    } catch {
      onNotificar("error", "Error al restablecer los textos.");
    }
  }, [textos, onActualizarTextosEnEstado, onToastSutil, onNotificar]);

  useEffect(() => {
    if (!editModeTextos) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRehacerTexto();
        else handleDeshacerTexto();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRehacerTexto();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editModeTextos, handleDeshacerTexto, handleRehacerTexto]);

  return {
    editModeTextos,
    setEditModeTextos,
    puedeDeshacer: undoStack.length > 0,
    puedeRehacer: redoStack.length > 0,
    handleGuardarTexto,
    handleDeshacerTexto,
    handleRehacerTexto,
    handleRestablecerTextos,
  };
}
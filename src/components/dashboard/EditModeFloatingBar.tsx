"use client";

interface EditModeFloatingBarProps {
  visible: boolean;
  puedeDeshacer: boolean;
  puedeRehacer: boolean;
  onDeshacer: () => void;
  onRehacer: () => void;
  onRestablecer: () => Promise<void>;
  onSalir: () => void;
}

export default function EditModeFloatingBar({
  visible,
  puedeDeshacer,
  puedeRehacer,
  onDeshacer,
  onRehacer,
  onRestablecer,
  onSalir,
}: EditModeFloatingBarProps) {
  if (!visible) return null;

  return (
    <div className="edit-mode-floating-bar">
      <span
        style={{
          fontSize: "0.84rem",
          fontWeight: 600,
          color: "var(--neutral-color)",
        }}
      >
        ✏️ Modo Edición de Textos
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={!puedeDeshacer}
        onClick={onDeshacer}
        title="Deshacer (Ctrl+Z)"
      >
        ↶ Deshacer
      </button>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={!puedeRehacer}
        onClick={onRehacer}
        title="Rehacer (Ctrl+Y)"
      >
        ↷ Rehacer
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => void onRestablecer()}
      >
        ↺ Restablecer
      </button>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={onSalir}
      >
        ✓ Salir
      </button>
    </div>
  );
}
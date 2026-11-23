"use client";

interface CategoriaEdicionFormProps {
  nombreOriginal: string;
  nombre: string;
  atajo: string;
  color: string;
  procesando: boolean;
  atajoDuplicado: string | null;
  onCambiarNombre: (v: string) => void;
  onCambiarAtajo: (v: string) => void;
  onCambiarColor: (v: string) => void;
  onCancelar: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function CategoriaEdicionForm({
  nombreOriginal,
  nombre,
  atajo,
  color,
  procesando,
  atajoDuplicado,
  onCambiarNombre,
  onCambiarAtajo,
  onCambiarColor,
  onCancelar,
  onSubmit,
}: CategoriaEdicionFormProps) {
  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        background: "rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          width: "100%",
          color: "var(--neutral-color)",
        }}
      >
        Editando categoría: <strong>{nombreOriginal}</strong>
      </span>
      <input
        type="color"
        aria-label="Color de categoría"
        value={color}
        onChange={(e) => onCambiarColor(e.target.value)}
        style={{
          width: "34px",
          height: "32px",
          padding: "2px",
          background: "var(--bg-canvas)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      />
      <input
        type="text"
        value={nombre}
        onChange={(e) => onCambiarNombre(e.target.value)}
        className="input-control"
        placeholder="Nuevo nombre"
        maxLength={60}
        required
        style={{ flex: 2, padding: "6px" }}
      />
      <input
        type="text"
        value={atajo}
        onChange={(e) => onCambiarAtajo(e.target.value)}
        className="input-control"
        placeholder="Auto (2 letras)"
        maxLength={10}
        style={{ flex: 1, padding: "6px" }}
      />
      <button
        type="submit"
        disabled={procesando}
        className="btn btn-primary btn-sm"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onCancelar}
        className="btn btn-secondary btn-sm"
      >
        Cancelar
      </button>

      {atajoDuplicado && (
        <span
          style={{
            width: "100%",
            fontSize: "0.73rem",
            color: "var(--range-end-color)",
          }}
        >
          ⚠️ Ese atajo ya está asignado a &quot;{atajoDuplicado}&quot;.
        </span>
      )}
    </form>
  );
}
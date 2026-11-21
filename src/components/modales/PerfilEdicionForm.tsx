"use client";

interface PerfilEdicionFormProps {
  nombreOriginal: string;
  nombre: string;
  descripcion: string;
  procesando: boolean;
  onCambiarNombre: (val: string) => void;
  onCambiarDescripcion: (val: string) => void;
  onCancelar: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function PerfilEdicionForm({
  nombreOriginal,
  nombre,
  descripcion,
  procesando,
  onCambiarNombre,
  onCambiarDescripcion,
  onCancelar,
  onSubmit,
}: PerfilEdicionFormProps) {
  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        background: "rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <span style={{ fontSize: "0.78rem", color: "var(--neutral-color)" }}>
        Editando perfil: <strong>{nombreOriginal}</strong>
      </span>
      <input
        type="text"
        value={nombre}
        onChange={(e) => onCambiarNombre(e.target.value)}
        className="input-control"
        placeholder="Nombre del perfil"
        required
        maxLength={80}
        style={{ padding: "6px 10px" }}
      />
      <input
        type="text"
        value={descripcion}
        onChange={(e) => onCambiarDescripcion(e.target.value)}
        className="input-control"
        placeholder="Descripción"
        maxLength={160}
        style={{ padding: "6px 10px" }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          type="button"
          onClick={onCancelar}
          className="btn btn-secondary btn-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={procesando}
          className="btn btn-primary btn-sm"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
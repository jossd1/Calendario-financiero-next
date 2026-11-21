"use client";

import { useEffect, useState } from "react";
import PerfilEdicionForm from "@/components/modales/PerfilEdicionForm";
import type { PerfilDTO } from "@/types";

interface ModalPerfilesProps {
  abierto: boolean;
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalPerfiles({
  abierto,
  perfiles,
  perfilActual,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalPerfilesProps) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");

  const [editPerfil, setEditPerfil] = useState<PerfilDTO | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [armadoId, setArmadoId] = useState<number | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (armadoId === null) return;
    const timer = setTimeout(() => setArmadoId(null), 3000);
    return () => clearTimeout(timer);
  }, [armadoId]);

  useEffect(() => {
    if (!abierto) {
      setEditPerfil(null);
      setArmadoId(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch("/api/perfiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          descripcion: nuevaDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo crear el perfil.");
        return;
      }
      setNuevoNombre("");
      setNuevaDesc("");
      onNotificar("success", data.mensaje ?? "Perfil creado y activado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al crear el perfil.");
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPerfil || !editNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch(`/api/perfiles/${editPerfil.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          descripcion: editDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo actualizar.");
        return;
      }
      setEditPerfil(null);
      onNotificar("success", data.mensaje ?? "Perfil actualizado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al actualizar perfil.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (perfilId: number) => {
    if (armadoId !== perfilId) {
      setArmadoId(perfilId);
      return;
    }
    setArmadoId(null);
    setProcesando(true);
    try {
      const res = await fetch(`/api/perfiles/${perfilId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo eliminar el perfil.");
        return;
      }
      onNotificar("success", data.mensaje ?? "Perfil eliminado.");
      await onActualizado();
    } catch {
      onNotificar("error", "Error de red al eliminar perfil.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" role="dialog" aria-modal="true">
        <div className="modal-content-box">
          <div className="panel-header">
            <h3 className="panel-title">Administración de Perfiles</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCerrar}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              marginBottom: "1rem",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "0.75rem",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
                color: "var(--accent-primary)",
              }}
            >
              Perfiles Registrados
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {perfiles.map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    <strong>{p.nombre}</strong>
                    {p.id === perfilActual.id && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          background: "var(--accent-primary)",
                          color: "#fff",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          marginLeft: "6px",
                        }}
                      >
                        Activo
                      </span>
                    )}
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {p.descripcion || "Sin descripción"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditPerfil(p);
                        setEditNombre(p.nombre);
                        setEditDesc(p.descripcion);
                      }}
                      style={{ padding: "2px 6px", fontSize: "0.7rem" }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className={`btn btn-danger btn-sm ${
                        armadoId === p.id ? "btn-danger-armed" : ""
                      }`}
                      onClick={() => void handleEliminar(p.id)}
                      style={{ padding: "2px 6px", fontSize: "0.7rem" }}
                      title="Eliminar"
                    >
                      {armadoId === p.id ? "⚠️ ¿Seguro?" : "🗑️"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {editPerfil && (
            <PerfilEdicionForm
              nombreOriginal={editPerfil.nombre}
              nombre={editNombre}
              descripcion={editDesc}
              procesando={procesando}
              onCambiarNombre={setEditNombre}
              onCambiarDescripcion={setEditDesc}
              onCancelar={() => setEditPerfil(null)}
              onSubmit={handleGuardarEdicion}
            />
          )}

          <form
            onSubmit={handleCrear}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              borderTop: "1px solid var(--border-hairline)",
              paddingTop: "10px",
            }}
          >
            <h4
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              + Añadir Nuevo Perfil
            </h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="input-control"
                placeholder="Nombre (ej. Negocio)..."
                required
                maxLength={80}
                style={{ flex: 1, padding: "6px" }}
              />
              <input
                type="text"
                value={nuevaDesc}
                onChange={(e) => setNuevaDesc(e.target.value)}
                className="input-control"
                placeholder="Descripción..."
                maxLength={160}
                style={{ flex: 1, padding: "6px" }}
              />
              <button
                type="submit"
                disabled={procesando}
                className="btn btn-primary btn-sm"
              >
                + Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
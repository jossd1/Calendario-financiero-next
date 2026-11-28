"use client";

import { useEffect, useState } from "react";
import AppIcon from "@/components/AppIcon";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import PerfilEdicionForm from "@/components/modales/PerfilEdicionForm";
import { MONEDAS_DISPONIBLES, obtenerMonedaInfo } from "@/lib/monedas";
import type { PerfilDTO, SubperfilDTO } from "@/types";

interface ModalPerfilesProps {
  abierto: boolean;
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
  subperfiles: SubperfilDTO[];
  onCerrar: () => void;
  onActualizado: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalPerfiles({
  abierto,
  perfiles,
  perfilActual,
  subperfiles,
  onCerrar,
  onActualizado,
  onNotificar,
}: ModalPerfilesProps) {
  const [tab, setTab] = useState<"perfiles" | "subperfiles">("perfiles");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");
  const [nuevaMoneda, setNuevaMoneda] = useState("PEN");
  const [editPerfil, setEditPerfil] = useState<PerfilDTO | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMoneda, setEditMoneda] = useState("PEN");
  const [armadoId, setArmadoId] = useState<number | null>(null);

  const [subNombre, setSubNombre] = useState("");
  const [subAtajo, setSubAtajo] = useState("");
  const [subIcono, setSubIcono] = useState("💳");
  const [editSub, setEditSub] = useState<SubperfilDTO | null>(null);
  const [procesando, setProcesando] = useState(false);

  const opcionesMoneda: CustomSelectOption[] = MONEDAS_DISPONIBLES.map((m) => ({
    value: m.codigo,
    label: `${m.codigo} · ${m.nombre}`,
    hint: m.simbolo,
  }));

  useEffect(() => {
    if (armadoId === null) return;
    const t = setTimeout(() => setArmadoId(null), 3000);
    return () => clearTimeout(t);
  }, [armadoId]);

  useEffect(() => {
    if (!abierto) {
      setEditPerfil(null);
      setEditSub(null);
      setArmadoId(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const moverOrden = async (tipo: "perfil" | "subperfil", idx: number, dir: -1 | 1) => {
    const lista = tipo === "perfil" ? perfiles : subperfiles;
    const dest = idx + dir;
    if (dest < 0 || dest >= lista.length) return;
    const copia = [...lista];
    const [mov] = copia.splice(idx, 1);
    copia.splice(dest, 0, mov);
    await fetch(tipo === "perfil" ? "/api/perfiles" : "/api/subperfiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordenIds: copia.map((x) => x.id) }),
    });
    await onActualizado();
  };

  const crearPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch("/api/perfiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre.trim(), descripcion: nuevaDesc.trim(), moneda: nuevaMoneda }),
      });
      const data = await res.json();
      if (!data.ok) return onNotificar("error", data.error ?? "No se pudo crear.");
      setNuevoNombre(""); setNuevaDesc(""); setNuevaMoneda("PEN");
      onNotificar("success", data.mensaje ?? "Perfil creado.");
      await onActualizado();
    } finally {
      setProcesando(false);
    }
  };

  const guardarEdicionPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPerfil || !editNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch(`/api/perfiles/${editPerfil.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre.trim(), descripcion: editDesc.trim(), moneda: editMoneda }),
      });
      const data = await res.json();
      if (!data.ok) return onNotificar("error", data.error ?? "Error.");
      setEditPerfil(null);
      onNotificar("success", "Perfil actualizado.");
      await onActualizado();
    } finally {
      setProcesando(false);
    }
  };

  const eliminarPerfil = async (id: number) => {
    if (armadoId !== id) return setArmadoId(id);
    setArmadoId(null);
    setProcesando(true);
    try {
      const res = await fetch(`/api/perfiles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) return onNotificar("error", data.error ?? "No se pudo eliminar.");
      onNotificar("success", "Perfil eliminado.");
      await onActualizado();
    } finally {
      setProcesando(false);
    }
  };

  const guardarSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subNombre.trim()) return;
    setProcesando(true);
    try {
      const res = await fetch(editSub ? `/api/subperfiles/${editSub.id}` : "/api/subperfiles", {
        method: editSub ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: subNombre.trim(),
          atajo: subAtajo.trim() || subNombre.trim().slice(0, 1).toLowerCase(),
          icono: subIcono.trim() || "💳",
        }),
      });
      const data = await res.json();
      if (!data.ok) return onNotificar("error", data.error ?? "Error.");
      setEditSub(null); setSubNombre(""); setSubAtajo(""); setSubIcono("💳");
      onNotificar("success", data.mensaje ?? "Subperfil guardado.");
      await onActualizado();
    } finally {
      setProcesando(false);
    }
  };

  const eliminarSub = async (id: number) => {
    const res = await fetch(`/api/subperfiles/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) return onNotificar("error", data.error ?? "No se pudo eliminar.");
    onNotificar("success", "Subperfil eliminado.");
    await onActualizado();
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" style={{ maxWidth: "600px" }} role="dialog" aria-modal="true">
        <div className="modal-content-box">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 className="panel-title">Perfiles y Subperfiles</h3>
              <div className="mode-pill-group">
                <button type="button" className={`mode-pill-btn ${tab === "perfiles" ? "active-fecha" : ""}`} onClick={() => setTab("perfiles")}>Perfiles</button>
                <button type="button" className={`mode-pill-btn ${tab === "subperfiles" ? "active-ver-dia" : ""}`} onClick={() => setTab("subperfiles")}>
                  Subperfiles ({perfilActual.nombre})
                </button>
              </div>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCerrar}>✕</button>
          </div>

          {tab === "perfiles" ? (
            <>
              <div style={{ maxHeight: "210px", overflowY: "auto", marginBottom: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {perfiles.map((p, idx) => {
                    const mInfo = obtenerMonedaInfo(p.moneda);
                    return (
                      <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", fontSize: "0.85rem" }}>
                        <div>
                          <strong>{p.nombre}</strong>
                          <span className="tabular-nums" style={{ fontSize: "0.7rem", background: "rgba(56,189,248,0.14)", color: "var(--neutral-color)", padding: "1px 6px", borderRadius: "4px", marginLeft: "6px" }}>
                            {mInfo.codigo} ({mInfo.simbolo})
                          </span>
                          {p.id === perfilActual.id && <span style={{ fontSize: "0.7rem", background: "var(--accent-primary)", color: "#fff", padding: "1px 5px", borderRadius: "4px", marginLeft: "6px" }}>Activo</span>}
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button type="button" disabled={idx === 0} className="btn btn-secondary btn-sm" onClick={() => void moverOrden("perfil", idx, -1)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>↑</button>
                          <button type="button" disabled={idx === perfiles.length - 1} className="btn btn-secondary btn-sm" onClick={() => void moverOrden("perfil", idx, 1)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>↓</button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditPerfil(p); setEditNombre(p.nombre); setEditDesc(p.descripcion); setEditMoneda(mInfo.codigo); }} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>✏️</button>
                          <button type="button" className={`btn btn-danger btn-sm ${armadoId === p.id ? "btn-danger-armed" : ""}`} onClick={() => void eliminarPerfil(p.id)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>
                            {armadoId === p.id ? "⚠️" : <AppIcon name="papelera" size={13} />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {editPerfil && (
                <PerfilEdicionForm nombreOriginal={editPerfil.nombre} nombre={editNombre} descripcion={editDesc} moneda={editMoneda} procesando={procesando} onCambiarNombre={setEditNombre} onCambiarDescripcion={setEditDesc} onCambiarMoneda={setEditMoneda} onCancelar={() => setEditPerfil(null)} onSubmit={guardarEdicionPerfil} />
              )}
              <form onSubmit={crearPerfil} style={{ display: "flex", flexDirection: "column", gap: "0.55rem", borderTop: "1px solid var(--border-hairline)", paddingTop: "10px" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="input-control" placeholder="Nombre del perfil..." required maxLength={80} style={{ flex: 1, minWidth: "150px", padding: "6px 10px" }} />
                  <input type="text" value={nuevaDesc} onChange={(e) => setNuevaDesc(e.target.value)} className="input-control" placeholder="Descripción..." maxLength={160} style={{ flex: 1, minWidth: "150px", padding: "6px 10px" }} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div style={{ flex: 1 }}><CustomSelect ariaLabel="Moneda" menuDirection="up" value={nuevaMoneda} options={opcionesMoneda} onChange={setNuevaMoneda} /></div>
                  <button type="submit" disabled={procesando} className="btn btn-primary btn-sm">+ Agregar</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div style={{ maxHeight: "220px", overflowY: "auto", marginBottom: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {subperfiles.map((s, idx) => (
                    <li key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", fontSize: "0.85rem" }}>
                      <span>{s.icono} <strong>{s.nombre}</strong> <code style={{ color: "var(--accent-primary)", marginLeft: "6px" }}>[{s.atajo}]</code></span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button type="button" disabled={idx === 0} className="btn btn-secondary btn-sm" onClick={() => void moverOrden("subperfil", idx, -1)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>↑</button>
                        <button type="button" disabled={idx === subperfiles.length - 1} className="btn btn-secondary btn-sm" onClick={() => void moverOrden("subperfil", idx, 1)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>↓</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditSub(s); setSubNombre(s.nombre); setSubAtajo(s.atajo); setSubIcono(s.icono); }} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>✏️</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => void eliminarSub(s.id)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}><AppIcon name="papelera" size={13} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <form onSubmit={guardarSub} style={{ display: "flex", gap: "0.5rem", alignItems: "center", borderTop: "1px solid var(--border-hairline)", paddingTop: "10px", flexWrap: "wrap" }}>
                <input type="text" value={subIcono} onChange={(e) => setSubIcono(e.target.value)} className="input-control" placeholder="Icono" maxLength={6} style={{ width: "56px", textAlign: "center", padding: "6px" }} />
                <input type="text" value={subNombre} onChange={(e) => setSubNombre(e.target.value)} className="input-control" placeholder="Nombre (ej. Yape, Efectivo)..." required maxLength={40} style={{ flex: 2, minWidth: "130px", padding: "6px 10px" }} />
                <input type="text" value={subAtajo} onChange={(e) => setSubAtajo(e.target.value)} className="input-control" placeholder="Atajo (letra/n°)" maxLength={10} style={{ flex: 1, minWidth: "90px", padding: "6px 10px" }} />
                <button type="submit" disabled={procesando} className="btn btn-primary btn-sm">{editSub ? "Guardar" : "+ Agregar"}</button>
                {editSub && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditSub(null); setSubNombre(""); setSubAtajo(""); }}>Cancelar</button>}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
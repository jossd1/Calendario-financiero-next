"use client";

import { useEffect, useState } from "react";
import type { PerfilDTO } from "@/types";

interface ModalTransferenciaProps {
  abierto: boolean;
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
  hoyIso: string;
  onCerrar: () => void;
  onTransferido: () => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ModalTransferencia({
  abierto,
  perfiles,
  perfilActual,
  hoyIso,
  onCerrar,
  onTransferido,
  onNotificar,
}: ModalTransferenciaProps) {
  const destinos = perfiles.filter((p) => p.id !== perfilActual.id);
  const [destinoId, setDestinoId] = useState<number>(destinos[0]?.id ?? 0);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyIso);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setDestinoId(destinos[0]?.id ?? 0);
    setFecha(hoyIso);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, hoyIso, onCerrar, destinos]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinoId) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/perfiles/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino_perfil_id: destinoId,
          monto,
          fecha,
          descripcion,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo transferir.");
        return;
      }
      setMonto("");
      setDescripcion("");
      onNotificar("success", data.mensaje ?? "Transferencia realizada.");
      await onTransferido();
      onCerrar();
    } catch {
      onNotificar("error", "Error de red al transferir.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-blur" onClick={onCerrar} />
      <div className="modal-flotante" role="dialog" aria-modal="true">
        <div className="modal-content-box">
          <div className="panel-header">
            <h3 className="panel-title">⇄ Transferir entre Perfiles</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCerrar}>
              ✕
            </button>
          </div>

          {destinos.length === 0 ? (
            <div className="empty-state">
              Necesitas crear al menos 2 perfiles (ej. Personal y Ahorros) en ⚙️ Perfil para hacer transferencias.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-field">
                <label>Perfil Origen</label>
                <input
                  type="text"
                  value={perfilActual.nombre}
                  disabled
                  className="input-control"
                />
              </div>

              <div className="form-field">
                <label htmlFor="tx-destino">Perfil Destino</label>
                <select
                  id="tx-destino"
                  value={destinoId}
                  onChange={(e) => setDestinoId(Number(e.target.value))}
                  className="input-control"
                  required
                >
                  {destinos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="tx-monto-tr">Monto (S/)</label>
                <input
                  id="tx-monto-tr"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="input-control tabular-nums"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="tx-fecha-tr">Fecha</label>
                <input
                  id="tx-fecha-tr"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="input-control tabular-nums"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="tx-desc-tr">Nota (Opcional)</label>
                <input
                  id="tx-desc-tr"
                  type="text"
                  maxLength={120}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Ahorro del mes..."
                  className="input-control"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={onCerrar}>
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="btn btn-primary">
                  {enviando ? "Transfiriendo..." : "Confirmar Transferencia"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
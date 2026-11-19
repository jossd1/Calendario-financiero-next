"use client";

import EditableText from "@/components/EditableText";
import type { PerfilDTO, TextosUI } from "@/types";

interface TopbarProps {
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
  cantidadPapelera: number;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  authPinActivo: boolean;
  onBloquearPin: () => void;
  onGuardarTexto: (clave: string, valor: string) => void;
  onTogglePrivacidad: () => void;
  onCambiarPerfil: (perfilId: number) => void;
  onAbrirCategorias: () => void;
  onAbrirPerfiles: () => void;
  onAbrirTransferencia: () => void;
  onAbrirPapelera: () => void;
  onAbrirAjustes: () => void;
  onResetInicio: () => void;
}

export default function Topbar({
  perfiles,
  perfilActual,
  cantidadPapelera,
  modoPrivacidad,
  authPinActivo,
  textos,
  editModeTextos,
  onGuardarTexto,
  onTogglePrivacidad,
  onBloquearPin,
  onCambiarPerfil,
  onAbrirCategorias,
  onAbrirPerfiles,
  onAbrirTransferencia,
  onAbrirPapelera,
  onAbrirAjustes,
  onResetInicio,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <button
            type="button"
            onClick={() => {
              if (!editModeTextos) onResetInicio();
            }}
            className="brand-title"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <EditableText
              clave="brandTitle"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </button>

          <nav className="topbar-nav" aria-label="Navegación principal">
            <a
              href="#calendario"
              className="topbar-link"
              onClick={(e) => {
                if (editModeTextos) e.preventDefault();
              }}
            >
              <EditableText
                clave="navCalendario"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </a>
            <a
              href="#analisis"
              className="topbar-link"
              onClick={(e) => {
                if (editModeTextos) e.preventDefault();
              }}
            >
              <EditableText
                clave="navAnalisis"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </a>
            <a
              href="#movimientos"
              className="topbar-link"
              onClick={(e) => {
                if (editModeTextos) e.preventDefault();
              }}
            >
              <EditableText
                clave="navMovimientos"
                textos={textos}
                editMode={editModeTextos}
                onGuardarTexto={onGuardarTexto}
              />
            </a>
          </nav>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onAbrirCategorias}
          >
            🏷️ Categorías
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onAbrirPerfiles}
          >
            ⚙️ Perfil
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onAbrirTransferencia}
            title="Transferir dinero entre perfiles"
          >
            ⇄ Transferir
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onAbrirPapelera}
          >
            🗑️ Papelera{cantidadPapelera > 0 ? ` (${cantidadPapelera})` : ""}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onTogglePrivacidad}
            title={
              modoPrivacidad
                ? "Mostrar montos en pantalla"
                : "Ocultar montos (S/ •••)"
            }
          >
            {modoPrivacidad ? "🙈" : "👁️"}
          </button>
          {authPinActivo && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBloquearPin}
              title="Bloquear aplicación con PIN"
            >
              🔒
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onAbrirAjustes}
            title="Ajustes y Personalización"
          >
            ⚙️ Ajustes
          </button>
          <a href="/api/exportar/csv" className="btn btn-secondary btn-sm">
            .CSV
          </a>

          <div className="profile-switcher-form">
            <select
              aria-label="Seleccionar perfil activo"
              className="profile-select"
              value={perfilActual.id}
              onChange={(e) => onCambiarPerfil(Number(e.target.value))}
            >
              {perfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
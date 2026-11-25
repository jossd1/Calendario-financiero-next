"use client";

import AppIcon from "@/components/AppIcon";
import CustomSelect from "@/components/CustomSelect";
import EditableText from "@/components/EditableText";
import { obtenerMonedaInfo } from "@/lib/monedas";
import type { PerfilDTO, TextosUI } from "@/types";

interface TopbarProps {
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
  cantidadPapelera: number;
  cantidadPendientes: number;
  programadosActivos: boolean;
  modoPrivacidad: boolean;
  paletaSobria: boolean;
  vistaSimple: boolean;
  mostrarBotonPaletaTopbar: boolean;
  authPinActivo: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onTogglePrivacidad: () => void;
  onTogglePaletaSobria: () => void;
  onToggleVistaSimple: () => void;
  onBloquearPin: () => void;
  onCambiarPerfil: (perfilId: number) => void;
  onAbrirCategorias: () => void;
  onAbrirPerfiles: () => void;
  onAbrirPapelera: () => void;
  onAbrirProgramados: () => void;
  onAbrirAjustes: () => void;
  onResetInicio: () => void;
}

export default function Topbar({
  perfiles,
  perfilActual,
  cantidadPapelera,
  cantidadPendientes,
  programadosActivos,
  modoPrivacidad,
  paletaSobria,
  vistaSimple,
  mostrarBotonPaletaTopbar,
  authPinActivo,
  textos,
  editModeTextos,
  onGuardarTexto,
  onTogglePrivacidad,
  onTogglePaletaSobria,
  onToggleVistaSimple,
  onBloquearPin,
  onCambiarPerfil,
  onAbrirCategorias,
  onAbrirPerfiles,
  onAbrirPapelera,
  onAbrirProgramados,
  onAbrirAjustes,
  onResetInicio,
}: TopbarProps) {
  const opcionesPerfiles = perfiles.map((p) => {
    const m = obtenerMonedaInfo(p.moneda);
    return {
      value: String(p.id),
      label: p.nombre,
      hint: `${m.codigo} ${m.simbolo}`,
    };
  });

  const monedaInfo = obtenerMonedaInfo(perfilActual.moneda);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          
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
            />{" "}
            <span
              className="tabular-nums"
              style={{ color: "var(--text-secondary)", fontWeight: 600 }}
              title={`Moneda activa: ${monedaInfo.nombre}`}
            >
              ({monedaInfo.simbolo})
            </span>
          </button>

          <div className="profile-combo">
            <button
              type="button"
              onClick={onAbrirPerfiles}
              className="profile-gear-btn"
              title="Administrar perfiles"
              aria-label="Administrar perfiles"
            >
              <AppIcon name="perfilEngranaje" size={17} />
            </button>
            <CustomSelect
              ariaLabel="Seleccionar perfil activo"
              className="compact"
              triggerClassName="profile-trigger"
              value={String(perfilActual.id)}
              options={opcionesPerfiles}
              onChange={(val) => onCambiarPerfil(Number(val))}
            />
          </div>

          <div className="mode-dual">
            {mostrarBotonPaletaTopbar && (
              <button
                type="button"
                onClick={onTogglePaletaSobria}
                className={`mode-dual-btn ${paletaSobria ? "is-active" : ""}`}
                title={
                  paletaSobria
                    ? "Paleta sobria activa (clic para restaurar colores)"
                    : "Activar paleta sobria oscura"
                }
                aria-label="Alternar paleta sobria oscura"
              >
                ◐
              </button>
            )}
            <button
              type="button"
              onClick={onToggleVistaSimple}
              className={`mode-dual-btn ${vistaSimple ? "is-active" : ""}`}
              title="Cambiar a Vista Simple estándar"
              aria-label="Cambiar a Vista Simple estándar"
            >
              ◫
            </button>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-topbar-tool"
            onClick={onAbrirCategorias}
          >
            <AppIcon name="categorias" size={16} />
            <span>Categorías</span>
          </button>

          <button
            type="button"
            className="btn btn-danger btn-topbar-tool"
            onClick={onAbrirPapelera}
          >
            <AppIcon name="papelera" size={16} />
            <span>
              Papelera{cantidadPapelera > 0 ? ` (${cantidadPapelera})` : ""}
            </span>
          </button>

          {programadosActivos && (
            <button
              type="button"
              className="btn btn-secondary btn-topbar-tool btn-topbar-icon topbar-badge-btn"
              onClick={onAbrirProgramados}
              title="Pagos Pendientes y Programados"
              aria-label="Pagos Pendientes y Programados"
            >
              <span style={{ fontSize: "1.02rem", lineHeight: 1 }}>⏳</span>
              {cantidadPendientes > 0 && (
                <span className="topbar-notif-badge">
                  {cantidadPendientes > 99 ? "99+" : cantidadPendientes}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-topbar-tool btn-topbar-icon"
            onClick={onTogglePrivacidad}
            title={
              modoPrivacidad
                ? "Mostrar montos en pantalla"
                : "Ocultar montos"
            }
            aria-label="Alternar privacidad de montos"
          >
            <span style={{ fontSize: "1.02rem", lineHeight: 1 }}>
              {modoPrivacidad ? "🙈" : "👁️"}
            </span>
          </button>

          {authPinActivo && (
            <button
              type="button"
              className="btn btn-secondary btn-topbar-tool btn-topbar-icon"
              onClick={onBloquearPin}
              title="Bloquear aplicación con PIN"
              aria-label="Bloquear aplicación con PIN"
            >
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>🔒</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-topbar-settings"
            onClick={onAbrirAjustes}
            title="Ajustes y Personalización"
          >
            <AppIcon name="ajustes" size={16} />
            <span>Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
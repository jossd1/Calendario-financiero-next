"use client";

import {
  AjustesActionRow,
  AjustesCard,
} from "@/components/modales/AjustesControles";
import type { AjustesAppConfig, CategoriaDTO } from "@/types";

interface SeccionGeneralProps {
  ajustes: AjustesAppConfig;
  categorias: CategoriaDTO[];
  editModeTextos: boolean;
  confirmandoReset: boolean;
  onToggleEditModeTextos: () => void;
  onCerrarModal: () => void;
  onPedirConfirmarReset: () => void;
  onEjecutarReset: () => Promise<void>;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
}

export default function SeccionGeneral({
  ajustes,
  categorias,
  editModeTextos,
  confirmandoReset,
  onToggleEditModeTextos,
  onCerrarModal,
  onPedirConfirmarReset,
  onEjecutarReset,
  onActualizarConfig,
}: SeccionGeneralProps) {
  return (
    <>
      <AjustesCard titulo="Edición de Textos en Pantalla">
        <AjustesActionRow
          titulo="Modo Edición en Vivo"
          descripcion="Edita cualquier título o etiqueta con un clic (acepta vacío y soporta Ctrl+Z)."
        >
          <button
            type="button"
            className={`btn btn-sm ${
              editModeTextos ? "btn-secondary" : "btn-primary"
            }`}
            onClick={() => {
              onToggleEditModeTextos();
              if (!editModeTextos) onCerrarModal();
            }}
          >
            {editModeTextos ? "Salir de Edición" : "✏️ Activar"}
          </button>
        </AjustesActionRow>

        <AjustesActionRow
          titulo="Restablecer Textos Originales"
          descripcion="Devuelve todos los títulos y etiquetas a su texto de fábrica."
        >
          <button
            type="button"
            className={`btn btn-sm ${
              confirmandoReset ? "btn-danger-armed" : "btn-danger"
            }`}
            onClick={() => {
              if (!confirmandoReset) {
                onPedirConfirmarReset();
                return;
              }
              void onEjecutarReset();
            }}
          >
            {confirmandoReset ? "⚠️ ¿Confirmar?" : "↺ Restablecer"}
          </button>
        </AjustesActionRow>
      </AjustesCard>

      <AjustesCard titulo="Comportamiento Rápido">
        <AjustesActionRow
          titulo="Categoría Predeterminada"
          descripcion="Categoría seleccionada inicialmente en el registro rápido."
        >
          <select
            value={ajustes.categoriaPredeterminada}
            onChange={(e) =>
              void onActualizarConfig({
                categoriaPredeterminada: e.target.value,
              })
            }
            className="input-control"
            style={{ width: "170px", padding: "6px 10px", fontSize: "0.82rem" }}
          >
            <option value="">Automática (primera)</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </AjustesActionRow>

        <AjustesActionRow
          titulo="Densidad Visual"
          descripcion="Espaciado de celdas y filas en el dashboard."
        >
          <select
            value={ajustes.densidad}
            onChange={(e) =>
              void onActualizarConfig({
                densidad: e.target.value as "comoda" | "compacta",
              })
            }
            className="input-control"
            style={{ width: "130px", padding: "6px 10px", fontSize: "0.82rem" }}
          >
            <option value="comoda">Cómoda</option>
            <option value="compacta">Compacta</option>
          </select>
        </AjustesActionRow>
      </AjustesCard>
    </>
  );
}
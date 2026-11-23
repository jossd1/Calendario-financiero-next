"use client";

import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
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
  const opcionesCategorias: CustomSelectOption[] = [
    { value: "", label: "Automática (primera)" },
    ...categorias.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#3b82f6",
    })),
  ];

  const opcionesDensidad: CustomSelectOption[] = [
    { value: "comoda", label: "Cómoda" },
    { value: "compacta", label: "Compacta" },
  ];

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
          <CustomSelect
            ariaLabel="Categoría predeterminada"
            className="compact"
            menuAlign="right"
            value={ajustes.categoriaPredeterminada}
            options={opcionesCategorias}
            onChange={(val) =>
              void onActualizarConfig({ categoriaPredeterminada: val })
            }
          />
        </AjustesActionRow>

        <AjustesActionRow
          titulo="Densidad Visual"
          descripcion="Espaciado de celdas y filas en el dashboard."
        >
          <CustomSelect
            ariaLabel="Densidad visual"
            className="compact"
            menuAlign="right"
            value={ajustes.densidad}
            options={opcionesDensidad}
            onChange={(val) =>
              void onActualizarConfig({
                densidad: val as "comoda" | "compacta",
              })
            }
          />
        </AjustesActionRow>
      </AjustesCard>
    </>
  );
}
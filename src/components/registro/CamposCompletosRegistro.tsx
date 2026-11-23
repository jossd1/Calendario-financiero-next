"use client";

import type { RefObject } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import EditableText from "@/components/EditableText";
import type { CategoriaDTO, TextosUI } from "@/types";

interface CamposCompletosRegistroProps {
  categoria: string;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  descripcion: string;
  inputDescRef: RefObject<HTMLInputElement | null>;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarCategoria: (nombre: string) => void;
  onCambiarDescripcion: (desc: string) => void;
  onFocusDescripcion: () => void;
}

export default function CamposCompletosRegistro({
  categoria,
  categoriasEgreso,
  categoriasIngreso,
  descripcion,
  inputDescRef,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarCategoria,
  onCambiarDescripcion,
  onFocusDescripcion,
}: CamposCompletosRegistroProps) {
  const opciones: CustomSelectOption[] = [
    ...categoriasEgreso.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#3b82f6",
      grupo: "Egresos",
      hint: c.atajo ? `[${c.atajo}]` : undefined,
    })),
    ...categoriasIngreso.map((c) => ({
      value: c.nombre,
      label: c.nombre,
      color: c.color || "#10b981",
      grupo: "Ingresos",
      hint: c.atajo ? `[${c.atajo}]` : undefined,
    })),
  ];

  return (
    <>
      <div className="form-field">
        <label htmlFor="categoria">
          <EditableText
            clave="labelCategoria"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </label>
        <CustomSelect
          id="categoria"
          ariaLabel="Categoría"
          value={categoria}
          options={opciones}
          onChange={onCambiarCategoria}
        />
      </div>

      <div className="form-field">
        <label htmlFor="descripcion">
          <EditableText
            clave="labelDescripcion"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </label>
        <input
          ref={inputDescRef}
          id="descripcion"
          name="descripcion"
          type="text"
          maxLength={240}
          placeholder="Detalle..."
          value={descripcion}
          onFocus={onFocusDescripcion}
          onChange={(e) => onCambiarDescripcion(e.target.value)}
          className="input-control"
        />
      </div>
    </>
  );
}

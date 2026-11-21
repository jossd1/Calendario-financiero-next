"use client";

import type { RefObject } from "react";
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
        <select
          id="categoria"
          name="categoria"
          value={categoria}
          onChange={(e) => onCambiarCategoria(e.target.value)}
          className="input-control"
          required
        >
          <optgroup label="Egresos">
            {categoriasEgreso.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre} {cat.atajo ? `[${cat.atajo}]` : ""}
              </option>
            ))}
          </optgroup>
          <optgroup label="Ingresos">
            {categoriasIngreso.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre} {cat.atajo ? `[${cat.atajo}]` : ""}
              </option>
            ))}
          </optgroup>
        </select>
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
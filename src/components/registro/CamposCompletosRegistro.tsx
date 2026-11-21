"use client";

import type { RefObject } from "react";
import EditableText from "@/components/EditableText";
import type { CategoriaDTO, EstadoMovimiento, TextosUI } from "@/types";

interface CamposCompletosRegistroProps {
  categoria: string;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  fechaSeleccionada: string;
  hoyIso: string;
  descripcion: string;
  estadoTx: EstadoMovimiento;
  programadosActivos: boolean;
  inputDescRef: RefObject<HTMLInputElement | null>;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarCategoria: (nombre: string) => void;
  onCambiarFecha: (fecha: string) => void;
  onCambiarDescripcion: (desc: string) => void;
  onFocusDescripcion: () => void;
  onCambiarEstadoTx: (estado: EstadoMovimiento) => void;
}

export default function CamposCompletosRegistro({
  categoria,
  categoriasEgreso,
  categoriasIngreso,
  fechaSeleccionada,
  hoyIso,
  descripcion,
  estadoTx,
  programadosActivos,
  inputDescRef,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarCategoria,
  onCambiarFecha,
  onCambiarDescripcion,
  onFocusDescripcion,
  onCambiarEstadoTx,
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
        <label htmlFor="fecha_tx">
          <EditableText
            clave="labelFechaTx"
            textos={textos}
            editMode={editModeTextos}
            onGuardarTexto={onGuardarTexto}
          />
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            id="fecha_tx"
            name="fecha"
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => onCambiarFecha(e.target.value)}
            className="input-control tabular-nums"
            required
          />
          <button
            type="button"
            onClick={() => onCambiarFecha(hoyIso)}
            className="btn btn-secondary btn-sm"
          >
            Hoy
          </button>
        </div>
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

      {programadosActivos && (
        <div className="form-field">
          <label htmlFor="estado_tx">Estado del Movimiento</label>
          <select
            id="estado_tx"
            value={estadoTx}
            onChange={(e) =>
              onCambiarEstadoTx(e.target.value as EstadoMovimiento)
            }
            className="input-control"
          >
            <option value="pagado">Pagado / Realizado</option>
            <option value="pendiente">Pendiente</option>
            <option value="programado">Programado</option>
          </select>
        </div>
      )}
    </>
  );
}
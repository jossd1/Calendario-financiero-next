"use client";

import { useMemo } from "react";
import EditableText from "@/components/EditableText";
import FiltroManualAnalisis from "@/components/analisis/FiltroManualAnalisis";
import GraficosFinancieros from "@/components/analisis/GraficosFinancieros";
import ResumenCategoriasTabla from "@/components/analisis/ResumenCategoriasTabla";
import type {
  AnalisisResultadoDTO,
  CategoriaDTO,
  ModoAnalisis,
  TextosUI,
} from "@/types";

interface PanelAnalisisProps {
  analisis: AnalisisResultadoDTO;
  categorias: CategoriaDTO[];
  modoAnalisis: ModoAnalisis;
  manualDesde: string;
  manualHasta: string;
  manualTipo: "todos" | "ingreso" | "egreso";
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
  onCambiarModoAnalisis: (modo: ModoAnalisis) => void;
  onAplicarManual: (
    desde: string,
    hasta: string,
    tipo: "todos" | "ingreso" | "egreso"
  ) => Promise<void>;
  onResetearAutomatico: () => Promise<void>;
}

export default function PanelAnalisis({
  analisis,
  categorias,
  modoAnalisis,
  manualDesde,
  manualHasta,
  manualTipo,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
  onCambiarModoAnalisis,
  onAplicarManual,
  onResetearAutomatico,
}: PanelAnalisisProps) {
  const colorPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of categorias) {
      mapa.set(c.nombre, c.color || "#3b82f6");
    }
    return mapa;
  }, [categorias]);

  return (
    <section className="panel" id="analisis">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <EditableText
              clave="tituloAnalisis"
              textos={textos}
              editMode={editModeTextos}
              onGuardarTexto={onGuardarTexto}
            />
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {modoAnalisis === "auto"
              ? "Sincronizado automáticamente con la vista: "
              : "Rango manual activo: "}
            <strong style={{ color: "var(--accent-primary)" }}>
              {analisis.titulo_rango}
            </strong>
          </span>
        </div>

        <div className="view-tabs" role="tablist" aria-label="Modo de análisis">
          <button
            type="button"
            className={`view-tab ${modoAnalisis === "auto" ? "active" : ""}`}
            onClick={() => {
              onCambiarModoAnalisis("auto");
              void onResetearAutomatico();
            }}
          >
            Automático
          </button>
          <button
            type="button"
            className={`view-tab ${modoAnalisis === "manual" ? "active" : ""}`}
            onClick={() => onCambiarModoAnalisis("manual")}
          >
            Manual
          </button>
        </div>
      </div>

      {modoAnalisis === "manual" && (
        <FiltroManualAnalisis
          analisis={analisis}
          manualDesde={manualDesde}
          manualHasta={manualHasta}
          manualTipo={manualTipo}
          modoPrivacidad={modoPrivacidad}
          onAplicarManual={onAplicarManual}
          onResetearAutomatico={onResetearAutomatico}
        />
      )}

      <GraficosFinancieros
        chartData={analisis.chart_data}
        colorPorCategoria={colorPorCategoria}
        modoPrivacidad={modoPrivacidad}
        textos={textos}
        editModeTextos={editModeTextos}
        onGuardarTexto={onGuardarTexto}
      />

      <ResumenCategoriasTabla
        desgloseEgresos={analisis.desglose_egresos_pct}
        colorPorCategoria={colorPorCategoria}
        modoPrivacidad={modoPrivacidad}
        textos={textos}
        editModeTextos={editModeTextos}
        onGuardarTexto={onGuardarTexto}
      />
    </section>
  );
}
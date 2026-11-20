"use client";

import {
  AjustesActionRow,
  AjustesCard,
  AjustesToggleRow,
} from "@/components/modales/AjustesControles";
import type { AjustesAppConfig } from "@/types";

interface SeccionAparienciaProps {
  ajustes: AjustesAppConfig;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
}

export default function SeccionApariencia({
  ajustes,
  onActualizarConfig,
}: SeccionAparienciaProps) {
  return (
    <AjustesCard titulo="Vistas y Tarjetas KPI">
      <AjustesToggleRow
        titulo="4to KPI: Categoría Top Egreso"
        descripcion="Muestra la categoría con mayor gasto del periodo (se oculta si no hay egresos)."
        badge="Activo"
        checked={ajustes.kpiTopEgreso}
        onChange={(v) => void onActualizarConfig({ kpiTopEgreso: v })}
      />
      <AjustesToggleRow
        titulo="Indicadores Comparativos en KPIs"
        descripcion="Muestra variación porcentual y diferencia respecto al periodo anterior."
        badge="Activo"
        checked={ajustes.comparativasKpi}
        onChange={(v) => void onActualizarConfig({ comparativasKpi: v })}
      />
      <AjustesToggleRow
        titulo="Vista Semanal (Semana)"
        descripcion="Agrega la pestaña Semana en la barra de vistas."
        badge="Activo"
        checked={ajustes.vistaSemanal}
        onChange={(v) => void onActualizarConfig({ vistaSemanal: v })}
      />
      <AjustesToggleRow
        titulo="Vista General Histórica"
        descripcion="Habilita el botón 🌐 General con resumen histórico total."
        badge="Activo"
        checked={ajustes.vistaGeneral}
        onChange={(v) => void onActualizarConfig({ vistaGeneral: v })}
      />
      <AjustesToggleRow
        titulo="Hover Preview en Días"
        descripcion="Muestra un resumen flotante al pasar el cursor por un día."
        badge="Activo"
        checked={ajustes.hoverPreviewDia}
        onChange={(v) => void onActualizarConfig({ hoverPreviewDia: v })}
      />
      <AjustesToggleRow
        titulo="Mostrar Neto Diario en Celdas"
        descripcion="Muestra una tercera línea con el balance neto en cada día del mes."
        badge="Activo"
        checked={ajustes.mostrarNetoCeldas}
        onChange={(v) => void onActualizarConfig({ mostrarNetoCeldas: v })}
      />
      <AjustesActionRow
        titulo="Alerta de Tope Diario (S/)"
        descripcion="Resalta en ámbar los días cuyo egreso supere este monto (0 = desactivado)."
      >
        <input
          type="number"
          min={0}
          step={10}
          value={ajustes.alertaTopeDiario}
          onChange={(e) =>
            void onActualizarConfig({
              alertaTopeDiario: Math.max(0, Number(e.target.value) || 0),
            })
          }
          className="input-control tabular-nums"
          style={{ width: "110px", padding: "6px 10px", fontSize: "0.82rem" }}
        />
      </AjustesActionRow>
    </AjustesCard>
  );
}
"use client";

import {
  AjustesActionRow,
  AjustesCard,
  AjustesToggleRow,
} from "@/components/modales/AjustesControles";
import type { AjustesAppConfig } from "@/types";

interface SeccionModulosProps {
  ajustes: AjustesAppConfig;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
}

export default function SeccionModulos({
  ajustes,
  onActualizarConfig,
}: SeccionModulosProps) {
  return (
    <AjustesCard titulo="Herramientas Financieras Opcionales">
      <AjustesToggleRow
        titulo="Presupuestos Mensuales por Categoría"
        descripcion="Límites de gasto mensual con barras de progreso y alertas."
        badge="Activo"
        checked={ajustes.presupuestosActivos}
        onChange={(v) => void onActualizarConfig({ presupuestosActivos: v })}
      />
      {ajustes.presupuestosActivos && (
        <AjustesActionRow
          titulo="Modo de Presupuestos"
          descripcion="Elige si los límites aplican cada mes o se configuran por mes puntual."
        >
          <select
            value={ajustes.modoPresupuesto}
            onChange={(e) =>
              void onActualizarConfig({
                modoPresupuesto: e.target.value as "base_mensual" | "por_mes",
              })
            }
            className="input-control"
            style={{ width: "160px", padding: "6px 10px", fontSize: "0.82rem" }}
          >
            <option value="base_mensual">Base mensual</option>
            <option value="por_mes">Por mes exacto</option>
          </select>
        </AjustesActionRow>
      )}
      <AjustesToggleRow
        titulo="Pagos Programados y Recurrentes"
        descripcion="Control de movimientos pagados, pendientes y programados."
        badge="Activo"
        checked={ajustes.programadosActivos}
        onChange={(v) => void onActualizarConfig({ programadosActivos: v })}
      />
      {ajustes.programadosActivos && (
        <AjustesToggleRow
          titulo="Incluir Pendientes en KPIs"
          descripcion="Si se desactiva, los pendientes quedan aparte como proyectado."
          badge="Activo"
          checked={ajustes.sumarProgramadosEnKpi}
          onChange={(v) =>
            void onActualizarConfig({ sumarProgramadosEnKpi: v })
          }
        />
      )}
      <AjustesToggleRow
        titulo="Vista General: Ahorro y Promedios"
        descripcion="Muestra Tasa de Ahorro Global y promedios mensuales en General."
        badge="Activo"
        checked={ajustes.generalMostrarAhorro}
        onChange={(v) => void onActualizarConfig({ generalMostrarAhorro: v })}
      />
      <AjustesToggleRow
        titulo="Vista General: Gráfico de Evolución"
        descripcion="Gráfico histórico de saldo acumulado y ahorro neto mes a mes."
        badge="Activo"
        checked={ajustes.generalMostrarEvolucion}
        onChange={(v) =>
          void onActualizarConfig({ generalMostrarEvolucion: v })
        }
      />
      <AjustesToggleRow
        titulo="Vista General: Récords y Top Categorías"
        descripcion="Muestra mejor mes, mes con mayor gasto y Top 5 categorías históricas."
        badge="Activo"
        checked={ajustes.generalMostrarRecords}
        onChange={(v) => void onActualizarConfig({ generalMostrarRecords: v })}
      />
      <AjustesToggleRow
        titulo="Vista General: Comparativa Año vs Año"
        descripcion="Tabla resumen comparando todos tus años registrados."
        badge="Activo"
        checked={ajustes.generalMostrarAnual}
        onChange={(v) => void onActualizarConfig({ generalMostrarAnual: v })}
      />
      <AjustesToggleRow
        titulo="Vista General: Consolidado Multi-Perfil"
        descripcion="Habilita el selector para ver el total sumado de todos tus perfiles."
        badge="Activo"
        checked={ajustes.generalPermitirConsolidado}
        onChange={(v) =>
          void onActualizarConfig({ generalPermitirConsolidado: v })
        }
      />
    </AjustesCard>
  );
}
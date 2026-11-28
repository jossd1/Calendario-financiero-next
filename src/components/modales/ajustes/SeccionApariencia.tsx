"use client";

import { useEffect, useState } from "react";
import {
  AjustesActionRow,
  AjustesCard,
  AjustesToggleRow,
} from "@/components/modales/AjustesControles";
import { obtenerMonedaInfo } from "@/lib/monedas";
import type { AjustesAppConfig } from "@/types";

interface SeccionAparienciaProps {
  ajustes: AjustesAppConfig;
  moneda: string;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
}

export default function SeccionApariencia({
  ajustes,
  moneda,
  onActualizarConfig,
}: SeccionAparienciaProps) {
  const [topeLocal, setTopeLocal] = useState(String(ajustes.alertaTopeDiario));
  const { simbolo } = obtenerMonedaInfo(moneda);

  useEffect(() => {
    setTopeLocal(String(ajustes.alertaTopeDiario));
  }, [ajustes.alertaTopeDiario]);

  const confirmarTope = () => {
    const nuevo = Math.max(0, Number(topeLocal) || 0);
    setTopeLocal(String(nuevo));
    if (nuevo !== ajustes.alertaTopeDiario) {
      void onActualizarConfig({ alertaTopeDiario: nuevo });
    }
  };

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
        titulo="Limitar Años del Calendario (2000–3000)"
        descripcion="Evita saltar a años fuera del rango 2000–3000. Desactívalo si necesitas otras fechas."
        badge="Activo"
        checked={ajustes.limitarAniosCalendario}
        onChange={(v) =>
          void onActualizarConfig({ limitarAniosCalendario: v })
        }
      />
      <AjustesToggleRow
        titulo="Paleta Sobria Oscura"
        descripcion="Tema suave sin fatiga visual para toda la aplicación y gráficos."
        badge="Activo"
        checked={ajustes.paletaSobria}
        onChange={(v) => void onActualizarConfig({ paletaSobria: v })}
      />
      <AjustesToggleRow
        titulo="Botón Rápido de Paleta en Topbar"
        descripcion="Muestra u oculta el acceso directo junto al selector de perfil."
        badge="Activo"
        checked={ajustes.mostrarBotonPaletaTopbar}
        onChange={(v) =>
          void onActualizarConfig({ mostrarBotonPaletaTopbar: v })
        }
      />
      <AjustesToggleRow
        titulo="Barra de Vista Previa en Registro"
        descripcion="Muestra la barra de atajo en Modo Completo que se colorea al detectar un atajo."
        badge="Activo"
        checked={ajustes.barraPreviewRegistro}
        onChange={(v) =>
          void onActualizarConfig({ barraPreviewRegistro: v })
        }
      />
      <AjustesToggleRow
        titulo="Tarjeta de Movimientos del Día"
        descripcion="Muestra los movimientos del día seleccionado debajo del registro rápido."
        badge="Activo"
        checked={ajustes.mostrarMovimientosDia}
        onChange={(v) =>
          void onActualizarConfig({ mostrarMovimientosDia: v })
        }
      />
      <AjustesToggleRow
        titulo="Historial Completo sin Límite de Altura"
        descripcion="Despliega todos los registros en la página principal sin caja de scroll."
        badge="Activo"
        checked={ajustes.sinLimiteHistorial}
        onChange={(v) => void onActualizarConfig({ sinLimiteHistorial: v })}
      />
      <AjustesActionRow
        titulo={`Alerta de Tope Diario (${simbolo})`}
        descripcion="Resalta en ámbar los días cuyo egreso supere este monto (0 = desactivado)."
      >
        <input
          type="number"
          min={0}
          step={10}
          value={topeLocal}
          onChange={(e) => setTopeLocal(e.target.value)}
          onBlur={confirmarTope}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="input-control tabular-nums"
          style={{ width: "110px", padding: "6px 10px", fontSize: "0.82rem" }}
        />
      </AjustesActionRow>
    </AjustesCard>
  );
}
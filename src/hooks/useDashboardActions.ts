"use client";

import { useCallback } from "react";
import { formatearFechaDMY } from "@/lib/format";
import { formatoMoneda } from "@/lib/monedas";
import type {
  DashboardEstadoDTO,
  ModoAnalisis,
  ModoCalendarioClick,
} from "@/types";

interface UseDashboardActionsParams {
  estado: DashboardEstadoDTO;
  notificar: (tipo: "success" | "error", texto: string) => void;
  lanzarToastSutil: (texto: string) => void;
  setDiaSeleccionado: (f: string) => void;
  setModoClick: (m: ModoCalendarioClick) => void;
  setPrimerToque: (p: { inicio: string; fin: string } | null) => void;
  setRangoDesde: (r: string | null) => void;
  setRangoHasta: (r: string | null) => void;
  setModoAnalisis: (m: ModoAnalisis) => void;
  setHistorialMes: (m: string) => void;
  setHistorialAnio: (a: string) => void;
  refrescarEstado: (overrides?: Record<string, unknown>) => Promise<DashboardEstadoDTO | null>;
}

export function useDashboardActions(params: UseDashboardActionsParams) {
  const {
    estado,
    notificar,
    lanzarToastSutil,
    setDiaSeleccionado,
    setModoClick,
    setPrimerToque,
    setRangoDesde,
    setRangoHasta,
    setModoAnalisis,
    setHistorialMes,
    setHistorialAnio,
    refrescarEstado,
  } = params;

  const handleCambiarPerfil = useCallback(
    async (perfilId: number) => {
      try {
        const res = await fetch("/api/perfiles/seleccionar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ perfil_id: perfilId }),
        });
        const data = await res.json();
        if (data.ok) {
          setHistorialMes("todos");
          await refrescarEstado({ historialMes: "todos" });
        }
      } catch {
        notificar("error", "No se pudo cambiar de perfil.");
      }
    },
    [notificar, refrescarEstado, setHistorialMes]
  );

  const handleRotarPerfil = useCallback(
    async (delta: number) => {
      if (estado.perfiles.length <= 1) return;
      const idx = estado.perfiles.findIndex(
        (p) => p.id === estado.perfil_actual.id
      );
      const base = idx >= 0 ? idx : 0;
      const next =
        estado.perfiles[(base + delta + estado.perfiles.length) % estado.perfiles.length];
      await handleCambiarPerfil(next.id);
    },
    [estado.perfiles, estado.perfil_actual.id, handleCambiarPerfil]
  );

  const handleCambiarSubperfil = useCallback(
    async (subperfilId: number | null) => {
      try {
        const res = await fetch("/api/subperfiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "seleccionar",
            subperfil_id: subperfilId,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          await refrescarEstado();
        }
      } catch {
        notificar("error", "No se pudo cambiar de subperfil.");
      }
    },
    [notificar, refrescarEstado]
  );

  const handleEliminarTx = useCallback(
    async (txId: number) => {
      try {
        const res = await fetch(`/api/transacciones/${txId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.ok) {
          notificar("error", data.error ?? "No se pudo eliminar.");
          return;
        }
        notificar("success", data.mensaje ?? "Movimiento enviado a papelera.");
        await refrescarEstado();
      } catch {
        notificar("error", "Error de red al eliminar la transacción.");
      }
    },
    [notificar, refrescarEstado]
  );

  const handleResetInicio = useCallback(async () => {
    const anioHoy = estado.hoy_iso.slice(0, 4);
    setDiaSeleccionado(estado.hoy_iso);
    setModoClick("precargar");
    setPrimerToque(null);
    setRangoDesde(null);
    setRangoHasta(null);
    setModoAnalisis("auto");
    setHistorialMes("todos");
    setHistorialAnio(anioHoy);
    await refrescarEstado({
      vista: "mensual",
      fecha: estado.hoy_iso,
      analisisModo: "auto",
      historialMes: "todos",
      historialAnio: anioHoy,
    });
  }, [
    estado.hoy_iso,
    refrescarEstado,
    setDiaSeleccionado,
    setHistorialAnio,
    setHistorialMes,
    setModoAnalisis,
    setModoClick,
    setPrimerToque,
    setRangoDesde,
    setRangoHasta,
  ]);

  const verificarAlertaTope = useCallback(
    (nuevoEstado: DashboardEstadoDTO | null, fechaTx: string) => {
      if (!nuevoEstado) return;
      const tope = nuevoEstado.ajustes.alertaTopeDiario;
      if (tope <= 0) return;

      let gastoDia = 0;
      if (nuevoEstado.semanas_calendario) {
        const celda = nuevoEstado.semanas_calendario
          .flat()
          .find((c) => c.fecha_iso === fechaTx);
        if (celda) gastoDia = celda.egresos;
      } else if (nuevoEstado.dias_semana_vista) {
        const dia = nuevoEstado.dias_semana_vista.find(
          (d) => d.fecha_iso === fechaTx
        );
        if (dia) gastoDia = dia.egresos;
      } else {
        gastoDia = nuevoEstado.transacciones_dia
          .filter((t) => t.tipo === "egreso")
          .reduce((acc, t) => acc + t.monto, 0);
      }

      if (gastoDia > tope) {
        const moneda = nuevoEstado.perfil_actual.moneda;
        lanzarToastSutil(
          `⚠️ El ${formatearFechaDMY(fechaTx)} superó tu tope diario de ${formatoMoneda(tope, moneda)} (${formatoMoneda(gastoDia, moneda)}).`
        );
      }
    },
    [lanzarToastSutil]
  );

  return {
    handleCambiarPerfil,
    handleRotarPerfil,
    handleCambiarSubperfil,
    handleEliminarTx,
    handleResetInicio,
    verificarAlertaTope,
  };
}

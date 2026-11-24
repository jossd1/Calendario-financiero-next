"use client";

import { useCallback } from "react";
import { formatearFechaDMY } from "@/lib/format";
import { formatoMoneda } from "@/lib/monedas";
import type {
  AccionActividad,
  DashboardEstadoDTO,
  ModoAnalisis,
  ModoCalendarioClick,
  TransaccionDTO,
} from "@/types";

interface UseDashboardActionsParams {
  estado: DashboardEstadoDTO;
  notificar: (tipo: "success" | "error", texto: string) => void;
  lanzarToastSutil: (texto: string) => void;
  registrarActividad: (accion: AccionActividad, tx: TransaccionDTO) => void;
  limpiarEventosSesion: () => void;
  setDiaSeleccionado: (f: string) => void;
  setModoClick: (m: ModoCalendarioClick) => void;
  setPrimerToque: (p: { inicio: string; fin: string } | null) => void;
  setRangoDesde: (r: string | null) => void;
  setRangoHasta: (r: string | null) => void;
  setModoAnalisis: (m: ModoAnalisis) => void;
  setFiltroCategoria: (c: string) => void;
  setFiltroTipo: (t: "todos" | "ingreso" | "egreso") => void;
  setFiltroBusqueda: (b: string) => void;
  refrescarEstado: (overrides?: Record<string, unknown>) => Promise<DashboardEstadoDTO | null>;
}

export function useDashboardActions(params: UseDashboardActionsParams) {
  const {
    estado,
    notificar,
    lanzarToastSutil,
    registrarActividad,
    limpiarEventosSesion,
    setDiaSeleccionado,
    setModoClick,
    setPrimerToque,
    setRangoDesde,
    setRangoHasta,
    setModoAnalisis,
    setFiltroCategoria,
    setFiltroTipo,
    setFiltroBusqueda,
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
          limpiarEventosSesion();
          setFiltroCategoria("todas");
          await refrescarEstado({ historialCategoria: "todas" });
        }
      } catch {
        notificar("error", "No se pudo cambiar de perfil.");
      }
    },
    [limpiarEventosSesion, notificar, refrescarEstado, setFiltroCategoria]
  );

  const handleEliminarTx = useCallback(
    async (txId: number) => {
      const txObjetivo =
        estado.transacciones_historial.find((t) => t.id === txId) ??
        estado.transacciones_dia.find((t) => t.id === txId) ??
        null;

      try {
        const res = await fetch(`/api/transacciones/${txId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.ok) {
          notificar("error", data.error ?? "No se pudo eliminar.");
          return;
        }
        if (txObjetivo) {
          registrarActividad("Eliminado", txObjetivo);
        }
        notificar("success", data.mensaje ?? "Movimiento enviado a papelera.");
        await refrescarEstado();
      } catch {
        notificar("error", "Error de red al eliminar la transacción.");
      }
    },
    [
      estado.transacciones_dia,
      estado.transacciones_historial,
      notificar,
      refrescarEstado,
      registrarActividad,
    ]
  );

  const handleResetInicio = useCallback(async () => {
    setDiaSeleccionado(estado.hoy_iso);
    setModoClick("precargar");
    setPrimerToque(null);
    setRangoDesde(null);
    setRangoHasta(null);
    setModoAnalisis("auto");
    setFiltroCategoria("todas");
    setFiltroTipo("todos");
    setFiltroBusqueda("");
    await refrescarEstado({
      vista: "mensual",
      fecha: estado.hoy_iso,
      analisisModo: "auto",
      historialCategoria: "todas",
      historialTipo: "todos",
      historialBusqueda: "",
    });
  }, [
    estado.hoy_iso,
    refrescarEstado,
    setDiaSeleccionado,
    setFiltroBusqueda,
    setFiltroCategoria,
    setFiltroTipo,
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
    handleEliminarTx,
    handleResetInicio,
    verificarAlertaTope,
  };
}
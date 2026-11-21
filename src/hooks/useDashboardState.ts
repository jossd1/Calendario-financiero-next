"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalisisRango } from "@/hooks/useAnalisisRango";
import { buildIsoDate } from "@/lib/format";
import type {
  AjustesAppConfig,
  DashboardEstadoDTO,
  FlashMensaje,
  ModoAnalisis,
  TextosUI,
  VistaCalendario,
} from "@/types";

interface QueryState {
  vista: VistaCalendario;
  fecha: string;
  analisisModo: ModoAnalisis;
  analisisDesde: string;
  analisisHasta: string;
  analisisTipo: "todos" | "ingreso" | "egreso";
  historialCategoria: string;
  historialTipo: "todos" | "ingreso" | "egreso";
  historialBusqueda: string;
  generalConsolidado: boolean;
}

export interface BottomToast {
  id: string;
  texto: string;
}

export function useDashboardState(initialEstado: DashboardEstadoDTO) {
  const [estado, setEstado] = useState<DashboardEstadoDTO>(initialEstado);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(
    initialEstado.fecha_ref
  );
  const [focusPing, setFocusPing] = useState<number>(0);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "ingreso" | "egreso">(
    "todos"
  );
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>("");
  const [generalConsolidado, setGeneralConsolidado] = useState<boolean>(false);

  const [flashes, setFlashes] = useState<FlashMensaje[]>([]);
  const [bottomToasts, setBottomToasts] = useState<BottomToast[]>([]);

  const notificar = useCallback(
    (tipo: "success" | "error", texto: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setFlashes((prev) => [...prev, { id, tipo, texto }]);
      setTimeout(() => {
        setFlashes((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const cerrarFlash = useCallback((id: string) => {
    setFlashes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const lanzarToastSutil = useCallback((texto: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setBottomToasts((prev) => [...prev, { id, texto }]);
    setTimeout(() => {
      setBottomToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const actualizarTextosLocal = useCallback((nuevos: TextosUI) => {
    setEstado((prev) => ({ ...prev, textos: nuevos }));
  }, []);

  const queryRef = useRef<QueryState>({
    vista: initialEstado.vista,
    fecha: initialEstado.fecha_ref,
    analisisModo: "auto",
    analisisDesde: initialEstado.analisis.desde,
    analisisHasta: initialEstado.analisis.hasta,
    analisisTipo: "todos",
    historialCategoria: "todas",
    historialTipo: "todos",
    historialBusqueda: "",
    generalConsolidado: false,
  });

  const refrescarEstado = useCallback(
    async (overrides: Partial<QueryState> = {}) => {
      const next: QueryState = { ...queryRef.current, ...overrides };
      queryRef.current = next;

      const qs = new URLSearchParams({
        vista: next.vista,
        fecha: next.fecha,
        analisisModo: next.analisisModo,
        analisisDesde: next.analisisDesde,
        analisisHasta: next.analisisHasta,
        analisisTipo: next.analisisTipo,
        historialCategoria: next.historialCategoria,
        historialTipo: next.historialTipo,
        historialBusqueda: next.historialBusqueda,
        generalConsolidado: next.generalConsolidado ? "1" : "0",
      });

      try {
        const res = await fetch(`/api/dashboard?${qs.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.ok && data.estado) {
          setEstado(data.estado as DashboardEstadoDTO);
          const urlParams = new URLSearchParams({
            vista: next.vista,
            fecha: next.fecha,
          });
          window.history.replaceState(null, "", `/?${urlParams.toString()}`);
        }
      } catch (error) {
        console.error("Error al refrescar dashboard:", error);
      }
    },
    []
  );

  const rango = useAnalisisRango({
    initialDesde: initialEstado.analisis.desde,
    initialHasta: initialEstado.analisis.hasta,
    onToastSutil: lanzarToastSutil,
    onRefrescarRango: async (dMin, dMax, tipo) => {
      await refrescarEstado({
        analisisModo: "manual",
        analisisDesde: dMin,
        analisisHasta: dMax,
        analisisTipo: tipo,
      });
    },
  });

  useEffect(() => {
    queryRef.current = {
      vista: estado.vista,
      fecha: estado.fecha_ref,
      analisisModo: rango.modoAnalisis,
      analisisDesde: rango.manualDesde,
      analisisHasta: rango.manualHasta,
      analisisTipo: rango.manualTipo,
      historialCategoria: filtroCategoria,
      historialTipo: filtroTipo,
      historialBusqueda: filtroBusqueda,
      generalConsolidado,
    };
  }, [
    estado.vista,
    estado.fecha_ref,
    rango.modoAnalisis,
    rango.manualDesde,
    rango.manualHasta,
    rango.manualTipo,
    filtroCategoria,
    filtroTipo,
    filtroBusqueda,
    generalConsolidado,
  ]);

  const handleActualizarConfig = useCallback(
    async (parcial: Partial<AjustesAppConfig>) => {
      setEstado((prev) => ({
        ...prev,
        ajustes: { ...prev.ajustes, ...parcial },
      }));
      try {
        const res = await fetch("/api/ajustes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: parcial }),
        });
        const data = await res.json();
        if (data.ok && data.config) {
          let siguienteVista = queryRef.current.vista;
          if (parcial.vistaSemanal === false && siguienteVista === "semana") {
            siguienteVista = "mensual";
          }
          if (parcial.vistaGeneral === false && siguienteVista === "general") {
            siguienteVista = "mensual";
          }
          await refrescarEstado({ vista: siguienteVista });
        }
      } catch {
        lanzarToastSutil("No se pudo guardar la configuración.");
      }
    },
    [lanzarToastSutil, refrescarEstado]
  );

  const handleClicDia = async (fechaIso: string) => {
    if (rango.modoClick === "precargar") {
      setDiaSeleccionado(fechaIso);
      setFocusPing((p) => p + 1);
      return;
    }

    if (rango.modoClick === "ver_dia") {
      setDiaSeleccionado(fechaIso);
      rango.setModoAnalisis("auto");
      await refrescarEstado({
        vista: "dia",
        fecha: fechaIso,
        analisisModo: "auto",
      });
      return;
    }

    await rango.completarRangoAnalizar(fechaIso, fechaIso);
  };

  const handleClicMesAnual = async (anio: number, mes: number) => {
    if (rango.modoClick === "analizar_dia") {
      const { inicioMes, finMes } = rango.resolverMesAnualRango(anio, mes);
      await rango.completarRangoAnalizar(inicioMes, finMes);
      return;
    }

    rango.setModoAnalisis("auto");
    await refrescarEstado({
      vista: "mensual",
      fecha: buildIsoDate(anio, mes, 1),
      analisisModo: "auto",
    });
  };

  const handleSaltoMagico = async (
    fechaIso: string,
    vistaDestino: "mensual" | "dia"
  ) => {
    setDiaSeleccionado(fechaIso);
    rango.setModoAnalisis("auto");
    await refrescarEstado({
      vista: vistaDestino,
      fecha: fechaIso,
      analisisModo: "auto",
    });
  };

  const handleCambiarFiltrosHistorial = useCallback(
    async (filtros: {
      categoria: string;
      tipo: "todos" | "ingreso" | "egreso";
      busqueda: string;
    }) => {
      setFiltroCategoria(filtros.categoria);
      setFiltroTipo(filtros.tipo);
      setFiltroBusqueda(filtros.busqueda);
      await refrescarEstado({
        historialCategoria: filtros.categoria,
        historialTipo: filtros.tipo,
        historialBusqueda: filtros.busqueda,
      });
    },
    [refrescarEstado]
  );

  return {
    estado,
    diaSeleccionado,
    setDiaSeleccionado,
    focusPing,
    ...rango,
    filtroCategoria,
    setFiltroCategoria,
    filtroTipo,
    setFiltroTipo,
    filtroBusqueda,
    setFiltroBusqueda,
    generalConsolidado,
    setGeneralConsolidado,
    flashes,
    cerrarFlash,
    bottomToasts,
    notificar,
    lanzarToastSutil,
    actualizarTextosLocal,
    refrescarEstado,
    handleActualizarConfig,
    handleClicDia,
    handleClicMesAnual,
    handleSaltoMagico,
    handleCambiarFiltrosHistorial,
  };
}
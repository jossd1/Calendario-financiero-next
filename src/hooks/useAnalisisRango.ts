"use client";

import { useState } from "react";
import { buildIsoDate, daysInMonth, formatearFechaDMY } from "@/lib/format";
import type { ModoAnalisis, ModoCalendarioClick } from "@/types";

interface PrimerToqueRango {
  inicio: string;
  fin: string;
}

interface UseAnalisisRangoParams {
  initialDesde: string;
  initialHasta: string;
  onToastSutil: (texto: string) => void;
  onRefrescarRango: (dMin: string, dMax: string, tipo: "todos" | "ingreso" | "egreso") => Promise<void>;
}

export function useAnalisisRango({
  initialDesde,
  initialHasta,
  onToastSutil,
  onRefrescarRango,
}: UseAnalisisRangoParams) {
  const [modoClick, setModoClickState] =
    useState<ModoCalendarioClick>("precargar");
  const [primerToque, setPrimerToque] = useState<PrimerToqueRango | null>(null);
  const [rangoDesde, setRangoDesde] = useState<string | null>(null);
  const [rangoHasta, setRangoHasta] = useState<string | null>(null);
  const [modoAnalisis, setModoAnalisis] = useState<ModoAnalisis>("auto");
  const [manualDesde, setManualDesde] = useState<string>(initialDesde);
  const [manualHasta, setManualHasta] = useState<string>(initialHasta);
  const [manualTipo, setManualTipo] = useState<"todos" | "ingreso" | "egreso">(
    "todos"
  );

  const setModoClick = (m: ModoCalendarioClick) => {
    setModoClickState(m);
    if (m !== "analizar_dia") {
      setPrimerToque(null);
      setRangoDesde(null);
      setRangoHasta(null);
    }
  };

  const completarRangoAnalizar = async (inicioSel: string, finSel: string) => {
    if (!primerToque || (rangoDesde && rangoHasta)) {
      setPrimerToque({ inicio: inicioSel, fin: finSel });
      setRangoDesde(inicioSel);
      setRangoHasta(null);
      return;
    }

    const invertido = inicioSel < primerToque.inicio;
    const dMin = invertido ? inicioSel : primerToque.inicio;
    const dMax = invertido ? primerToque.fin : finSel;

    setPrimerToque(null);
    setRangoDesde(dMin);
    setRangoHasta(dMax);
    setModoAnalisis("manual");
    setManualDesde(dMin);
    setManualHasta(dMax);

    if (invertido) {
      onToastSutil(
        `Orden invertido automáticamente: del ${formatearFechaDMY(dMin)} al ${formatearFechaDMY(dMax)}`
      );
    }

    await onRefrescarRango(dMin, dMax, manualTipo);
    document.getElementById("analisis")?.scrollIntoView({ behavior: "smooth" });
  };

  const resolverMesAnualRango = (anio: number, mes: number) => {
    const inicioMes = buildIsoDate(anio, mes, 1);
    const finMes = buildIsoDate(anio, mes, daysInMonth(anio, mes));
    return { inicioMes, finMes };
  };

  return {
    modoClick,
    setModoClick,
    setPrimerToque,
    rangoDesde,
    rangoHasta,
    setRangoDesde,
    setRangoHasta,
    modoAnalisis,
    setModoAnalisis,
    manualDesde,
    setManualDesde,
    manualHasta,
    setManualHasta,
    manualTipo,
    setManualTipo,
    completarRangoAnalizar,
    resolverMesAnualRango,
  };
}
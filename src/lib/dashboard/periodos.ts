import {
  MESES_ES,
  addDaysISO,
  addMonthsISO,
  buildIsoDate,
  daysInMonth,
  formatearFechaCortaDM,
  formatearFechaDMY,
  parseIsoDateParts,
} from "@/lib/format";
import type { VistaCalendario } from "@/types";

export function calcularRangoPeriodo(
  vista: VistaCalendario,
  fechaRef: string
): { inicio: string; fin: string; tituloPeriodo: string } {
  const { year, month, day } = parseIsoDateParts(fechaRef);

  if (vista === "general") {
    return {
      inicio: "1900-01-01",
      fin: "2099-12-31",
      tituloPeriodo: "Histórico General",
    };
  }

  if (vista === "dia") {
    return {
      inicio: fechaRef,
      fin: fechaRef,
      tituloPeriodo: `Día ${formatearFechaDMY(fechaRef)}`,
    };
  }

  if (vista === "semana") {
    const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const inicio = addDaysISO(fechaRef, -dow);
    const fin = addDaysISO(inicio, 6);
    return {
      inicio,
      fin,
      tituloPeriodo: `Semana ${formatearFechaCortaDM(inicio)} – ${formatearFechaDMY(fin)}`,
    };
  }

  if (vista === "anual") {
    return {
      inicio: buildIsoDate(year, 1, 1),
      fin: buildIsoDate(year, 12, 31),
      tituloPeriodo: `Año ${year}`,
    };
  }

  const ultimoDia = daysInMonth(year, month);
  return {
    inicio: buildIsoDate(year, month, 1),
    fin: buildIsoDate(year, month, ultimoDia),
    tituloPeriodo: `${MESES_ES[month]} ${year}`,
  };
}

export function calcularNavegacionPeriodo(
  vista: VistaCalendario,
  fechaRef: string
): { fechaAnterior: string; fechaSiguiente: string } {
  const { year } = parseIsoDateParts(fechaRef);

  if (vista === "anual") {
    return {
      fechaAnterior: buildIsoDate(year - 1, 1, 1),
      fechaSiguiente: buildIsoDate(year + 1, 1, 1),
    };
  }

  if (vista === "semana") {
    return {
      fechaAnterior: addDaysISO(fechaRef, -7),
      fechaSiguiente: addDaysISO(fechaRef, 7),
    };
  }

  if (vista === "dia") {
    return {
      fechaAnterior: addDaysISO(fechaRef, -1),
      fechaSiguiente: addDaysISO(fechaRef, 1),
    };
  }

  return {
    fechaAnterior: addMonthsISO(fechaRef, -1),
    fechaSiguiente: addMonthsISO(fechaRef, 1),
  };
}

export function calcularRangoPeriodoAnterior(
  vista: VistaCalendario,
  fechaRef: string,
  inicioActual: string,
  finActual: string
): { prevInicio: string; prevFin: string } {
  const { year } = parseIsoDateParts(fechaRef);

  if (vista === "dia") {
    const ayer = addDaysISO(fechaRef, -1);
    return { prevInicio: ayer, prevFin: ayer };
  }

  if (vista === "semana") {
    return {
      prevInicio: addDaysISO(inicioActual, -7),
      prevFin: addDaysISO(finActual, -7),
    };
  }

  if (vista === "anual") {
    return {
      prevInicio: buildIsoDate(year - 1, 1, 1),
      prevFin: buildIsoDate(year - 1, 12, 31),
    };
  }

  const prevInicio = addMonthsISO(inicioActual, -1);
  const prevParts = parseIsoDateParts(prevInicio);
  const prevUltimo = daysInMonth(prevParts.year, prevParts.month);
  return {
    prevInicio,
    prevFin: buildIsoDate(prevParts.year, prevParts.month, prevUltimo),
  };
}
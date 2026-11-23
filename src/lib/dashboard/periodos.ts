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

export const MIN_ANIO_CALENDARIO = 2000;
export const MAX_ANIO_CALENDARIO = 3000;

export function limitarFechaAnios(iso: string, limitar: boolean): string {
  if (!limitar) return iso;
  const { year } = parseIsoDateParts(iso);
  if (year < MIN_ANIO_CALENDARIO) {
    return buildIsoDate(MIN_ANIO_CALENDARIO, 1, 1);
  }
  if (year > MAX_ANIO_CALENDARIO) {
    return buildIsoDate(MAX_ANIO_CALENDARIO, 12, 31);
  }
  return iso;
}

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
    const dow = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
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
  fechaRef: string,
  limitarAnios = false
): { fechaAnterior: string; fechaSiguiente: string } {
  const { year, month } = parseIsoDateParts(fechaRef);
  let fechaAnterior: string;
  let fechaSiguiente: string;

  if (vista === "anual") {
    const antY = limitarAnios ? Math.max(MIN_ANIO_CALENDARIO, year - 1) : year - 1;
    const sigY = limitarAnios ? Math.min(MAX_ANIO_CALENDARIO, year + 1) : year + 1;
    fechaAnterior = buildIsoDate(antY, 1, 1);
    fechaSiguiente = buildIsoDate(sigY, 1, 1);
  } else if (vista === "semana") {
    fechaAnterior = limitarFechaAnios(addDaysISO(fechaRef, -7), limitarAnios);
    fechaSiguiente = limitarFechaAnios(addDaysISO(fechaRef, 7), limitarAnios);
  } else if (vista === "dia") {
    fechaAnterior = limitarFechaAnios(addDaysISO(fechaRef, -1), limitarAnios);
    fechaSiguiente = limitarFechaAnios(addDaysISO(fechaRef, 1), limitarAnios);
  } else {
    const antRaw = addMonthsISO(fechaRef, -1);
    const sigRaw = addMonthsISO(fechaRef, 1);
    fechaAnterior =
      limitarAnios && year <= MIN_ANIO_CALENDARIO && month === 1
        ? buildIsoDate(MIN_ANIO_CALENDARIO, 1, 1)
        : limitarFechaAnios(antRaw, limitarAnios);
    fechaSiguiente =
      limitarAnios && year >= MAX_ANIO_CALENDARIO && month === 12
        ? buildIsoDate(MAX_ANIO_CALENDARIO, 12, 1)
        : limitarFechaAnios(sigRaw, limitarAnios);
  }

  return { fechaAnterior, fechaSiguiente };
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
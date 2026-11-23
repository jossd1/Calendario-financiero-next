import {
  DIAS_SEMANA_ES,
  MESES_ES,
  addDaysISO,
  buildIsoDate,
  daysInMonth,
  formatearFechaCortaDM,
  parseIsoDateParts,
} from "@/lib/format";
import type {
  CeldaCalendario,
  DiaSemanaDetalle,
  MesAnual,
  TransaccionDTO,
} from "@/types";

export function construirCalendarioMensual(
  anio: number,
  mes: number,
  listaTx: TransaccionDTO[],
  hoyIso: string
): CeldaCalendario[][] {
  const porFecha = new Map<
    string,
    {
      ingresos: number;
      egresos: number;
      cantidad: number;
      items: TransaccionDTO[];
    }
  >();

  for (const tx of listaTx) {
    const actual = porFecha.get(tx.fecha_iso) ?? {
      ingresos: 0,
      egresos: 0,
      cantidad: 0,
      items: [],
    };
    if (tx.tipo === "ingreso") actual.ingresos += tx.monto;
    else actual.egresos += tx.monto;

    actual.cantidad += 1;
    if (actual.items.length < 4) actual.items.push(tx);
    porFecha.set(tx.fecha_iso, actual);
  }

  const primerDiaMes = buildIsoDate(anio, mes, 1);
  const ultimoDiaNum = daysInMonth(anio, mes);
  const ultimoDiaMes = buildIsoDate(anio, mes, ultimoDiaNum);

  const primerDiaSemana =
    (new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay() + 6) % 7;
  const ultimoDiaSemana =
    (new Date(Date.UTC(anio, mes - 1, ultimoDiaNum)).getUTCDay() + 6) % 7;

  const inicioGrid = addDaysISO(primerDiaMes, -primerDiaSemana);
  const finGrid = addDaysISO(ultimoDiaMes, 6 - ultimoDiaSemana);

  const semanas: CeldaCalendario[][] = [];
  let cursor = inicioGrid;

  while (cursor <= finGrid) {
    const fila: CeldaCalendario[] = [];
    for (let i = 0; i < 7; i++) {
      const parts = parseIsoDateParts(cursor);
      const info = porFecha.get(cursor) ?? {
        ingresos: 0,
        egresos: 0,
        cantidad: 0,
        items: [],
      };
      fila.push({
        fecha_iso: cursor,
        dia: parts.day,
        es_mes_actual: parts.month === mes && parts.year === anio,
        es_hoy: cursor === hoyIso,
        ingresos: Number(info.ingresos.toFixed(2)),
        egresos: Number(info.egresos.toFixed(2)),
        neto: Number((info.ingresos - info.egresos).toFixed(2)),
        cantidad: info.cantidad,
        top_items: info.items,
      });
      cursor = addDaysISO(cursor, 1);
    }
    semanas.push(fila);
  }

  return semanas;
}

export function construirVistaSemanal(
  inicioSemana: string,
  listaTx: TransaccionDTO[],
  hoyIso: string
): DiaSemanaDetalle[] {
  const porFecha = new Map<string, TransaccionDTO[]>();
  for (const tx of listaTx) {
    const arr = porFecha.get(tx.fecha_iso) ?? [];
    arr.push(tx);
    porFecha.set(tx.fecha_iso, arr);
  }

  const dias: DiaSemanaDetalle[] = [];
  for (let i = 0; i < 7; i++) {
    const fechaIso = addDaysISO(inicioSemana, i);
    const items = porFecha.get(fechaIso) ?? [];
    const ingresos = items
      .filter((t) => t.tipo === "ingreso")
      .reduce((acc, t) => acc + t.monto, 0);
    const egresos = items
      .filter((t) => t.tipo === "egreso")
      .reduce((acc, t) => acc + t.monto, 0);

    dias.push({
      fecha_iso: fechaIso,
      dia_nombre: DIAS_SEMANA_ES[i],
      fecha_corta: formatearFechaCortaDM(fechaIso),
      es_hoy: fechaIso === hoyIso,
      ingresos: Number(ingresos.toFixed(2)),
      egresos: Number(egresos.toFixed(2)),
      neto: Number((ingresos - egresos).toFixed(2)),
      items,
    });
  }
  return dias;
}

export function construirVistaAnual(listaTx: TransaccionDTO[]): MesAnual[] {
  const meses: MesAnual[] = Array.from({ length: 12 }, (_, idx) => ({
    mes: idx + 1,
    nombre: MESES_ES[idx + 1],
    ingresos: 0,
    egresos: 0,
    neto: 0,
    cantidad: 0,
  }));

  for (const tx of listaTx) {
    const { month } = parseIsoDateParts(tx.fecha_iso);
    const idx = month - 1;
    if (idx >= 0 && idx < 12) {
      if (tx.tipo === "ingreso") meses[idx].ingresos += tx.monto;
      else meses[idx].egresos += tx.monto;
      meses[idx].neto = meses[idx].ingresos - meses[idx].egresos;
      meses[idx].cantidad += 1;
    }
  }

  return meses.map((m) => ({
    ...m,
    ingresos: Number(m.ingresos.toFixed(2)),
    egresos: Number(m.egresos.toFixed(2)),
    neto: Number(m.neto.toFixed(2)),
  }));
}
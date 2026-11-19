import { and, between, desc, eq, gt, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { obtenerAjustesApp } from "@/lib/ajustes";
import {
  calcularTopEgresoKpi,
  compilarAnalisis,
} from "@/lib/dashboard/analisis";
import {
  construirCalendarioMensual,
  construirVistaAnual,
  construirVistaSemanal,
} from "@/lib/dashboard/calendario";
import { compilarDatosGenerales } from "@/lib/dashboard/general";
import {
  calcularNavegacionPeriodo,
  calcularRangoPeriodo,
  calcularRangoPeriodoAnterior,
} from "@/lib/dashboard/periodos";
import {
  addDaysISO,
  daysInMonth,
  esFechaISOValida,
  formatearFechaDMY,
  formatearHoraLima,
  formatoSoles,
  obtenerHoyPeruISO,
  parseIsoDateParts,
} from "@/lib/format";
import { obtenerCategoriasPerfil, obtenerPerfilActivo } from "@/lib/perfil";
import type {
  ComparativaKpiDTO,
  DashboardEstadoDTO,
  TransaccionDTO,
  VistaCalendario,
} from "@/types";

export function mapearTransaccion(
  row: typeof transacciones.$inferSelect
): TransaccionDTO {
  const monto = Number(row.monto);
  const fechaIso = String(row.fecha);
  return {
    id: row.id,
    perfil_id: row.perfil_id,
    tipo: row.tipo === "ingreso" ? "ingreso" : "egreso",
    monto,
    monto_fmt: formatoSoles(monto),
    categoria: row.categoria,
    descripcion: row.descripcion ?? "",
    fecha_iso: fechaIso,
    fecha_fmt: formatearFechaDMY(fechaIso),
    hora_fmt: formatearHoraLima(row.creado_en),
    eliminado: Boolean(row.eliminado),
  };
}

function calcularDeltaPct(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Number((((actual - anterior) / anterior) * 100).toFixed(1));
}

export interface CompilarDashboardParams {
  vista?: string | null;
  fecha?: string | null;
  analisisModo?: string | null;
  analisisDesde?: string | null;
  analisisHasta?: string | null;
  analisisTipo?: string | null;
  historialCategoria?: string | null;
  historialTipo?: string | null;
  historialBusqueda?: string | null;
  generalConsolidado?: string | null;
}

export async function compilarEstadoDashboard(
  params: CompilarDashboardParams = {}
): Promise<DashboardEstadoDTO> {
  const hoyIso = obtenerHoyPeruISO();
  const { config: ajustes, textos } = await obtenerAjustesApp();

  let vista: VistaCalendario = "mensual";
  if (params.vista === "dia" || params.vista === "anual") vista = params.vista;
  else if (params.vista === "semana" && ajustes.vistaSemanal) vista = "semana";
  else if (params.vista === "general" && ajustes.vistaGeneral) vista = "general";

  const fechaRef = esFechaISOValida(params.fecha) ? params.fecha : hoyIso;
  const { perfiles, perfilActual } = await obtenerPerfilActivo();
  const { todas, egresos, ingresos } = await obtenerCategoriasPerfil(
    perfilActual.id
  );

  const { inicio, fin, tituloPeriodo } = calcularRangoPeriodo(vista, fechaRef);
  const { fechaAnterior, fechaSiguiente } = calcularNavegacionPeriodo(
    vista,
    fechaRef
  );

  const partsRef = parseIsoDateParts(fechaRef);
  let inicioConsultaGrid = inicio;
  let finConsultaGrid = fin;
  if (vista === "mensual") {
    const primerDiaSemana = new Date(
      Date.UTC(partsRef.year, partsRef.month - 1, 1)
    ).getUTCDay();
    const ultimoDiaNum = daysInMonth(partsRef.year, partsRef.month);
    const ultimoDiaSemana = new Date(
      Date.UTC(partsRef.year, partsRef.month - 1, ultimoDiaNum)
    ).getUTCDay();
    inicioConsultaGrid = addDaysISO(inicio, -primerDiaSemana);
    finConsultaGrid = addDaysISO(fin, 6 - ultimoDiaSemana);
  }

  const filasGrid = await db
    .select()
    .from(transacciones)
    .where(
      and(
        eq(transacciones.perfil_id, perfilActual.id),
        eq(transacciones.eliminado, false),
        between(transacciones.fecha, inicioConsultaGrid, finConsultaGrid),
        gt(transacciones.monto, "0")
      )
    )
    .orderBy(desc(transacciones.fecha), desc(transacciones.id));

  const txGrid = filasGrid.map(mapearTransaccion);
  const txPeriodo = txGrid.filter(
    (tx) => tx.fecha_iso >= inicio && tx.fecha_iso <= fin
  );

  const totalIngresos = txPeriodo
    .filter((tx) => tx.tipo === "ingreso")
    .reduce((acc, tx) => acc + tx.monto, 0);
  const totalEgresos = txPeriodo
    .filter((tx) => tx.tipo === "egreso")
    .reduce((acc, tx) => acc + tx.monto, 0);
  const balanceNeto = totalIngresos - totalEgresos;

  const topEgresoKpi = ajustes.kpiTopEgreso
    ? calcularTopEgresoKpi(txPeriodo, totalEgresos, todas)
    : null;

  let comparativaKpi: ComparativaKpiDTO | null = null;
  if (ajustes.comparativasKpi && vista !== "general") {
    const { prevInicio, prevFin } = calcularRangoPeriodoAnterior(
      vista,
      fechaRef,
      inicio,
      fin
    );
    const filasPrev = await db
      .select({ tipo: transacciones.tipo, monto: transacciones.monto })
      .from(transacciones)
      .where(
        and(
          eq(transacciones.perfil_id, perfilActual.id),
          eq(transacciones.eliminado, false),
          between(transacciones.fecha, prevInicio, prevFin),
          gt(transacciones.monto, "0")
        )
      );

    let ingPrev = 0;
    let egrPrev = 0;
    for (const r of filasPrev) {
      const m = Number(r.monto);
      if (r.tipo === "ingreso") ingPrev += m;
      else egrPrev += m;
    }
    const balPrev = ingPrev - egrPrev;
    comparativaKpi = {
      ingresos_anterior: Number(ingPrev.toFixed(2)),
      egresos_anterior: Number(egrPrev.toFixed(2)),
      balance_anterior: Number(balPrev.toFixed(2)),
      ingresos_pct_delta: calcularDeltaPct(totalIngresos, ingPrev),
      egresos_pct_delta: calcularDeltaPct(totalEgresos, egrPrev),
      balance_diff: Number((balanceNeto - balPrev).toFixed(2)),
    };
  }

  const semanasCalendario =
    vista === "mensual"
      ? construirCalendarioMensual(partsRef.year, partsRef.month, txGrid, hoyIso)
      : null;
  const diasSemanaVista =
    vista === "semana" ? construirVistaSemanal(inicio, txPeriodo, hoyIso) : null;
  const mesesAnual = vista === "anual" ? construirVistaAnual(txPeriodo) : null;

  const datosGeneral =
    vista === "general"
      ? await compilarDatosGenerales(
          perfilActual.id,
          params.generalConsolidado === "1" &&
            ajustes.generalPermitirConsolidado
        )
      : null;

  const modoManualActivo =
    params.analisisModo === "manual" &&
    esFechaISOValida(params.analisisDesde) &&
    esFechaISOValida(params.analisisHasta);

  let analisisDesde = inicio;
  let analisisHasta = fin;
  let tituloRangoAnalisis = `${tituloPeriodo} (${formatearFechaDMY(inicio)} – ${formatearFechaDMY(fin)})`;
  let txParaAnalisis = txPeriodo;
  let esAnualCompleta = vista === "anual";

  if (vista === "general") {
    analisisDesde = txPeriodo.length
      ? txPeriodo[txPeriodo.length - 1].fecha_iso
      : hoyIso;
    analisisHasta = hoyIso;
    tituloRangoAnalisis = "Histórico Completo";
    esAnualCompleta = false;
  }

  if (modoManualActivo) {
    const rawDesde = params.analisisDesde!;
    const rawHasta = params.analisisHasta!;
    analisisDesde = rawDesde <= rawHasta ? rawDesde : rawHasta;
    analisisHasta = rawDesde <= rawHasta ? rawHasta : rawDesde;
    tituloRangoAnalisis = `Manual: ${formatearFechaDMY(analisisDesde)} al ${formatearFechaDMY(analisisHasta)}`;
    esAnualCompleta = false;

    const condicionesAnalisis = [
      eq(transacciones.perfil_id, perfilActual.id),
      eq(transacciones.eliminado, false),
      between(transacciones.fecha, analisisDesde, analisisHasta),
      gt(transacciones.monto, "0"),
    ];
    if (params.analisisTipo === "ingreso" || params.analisisTipo === "egreso") {
      condicionesAnalisis.push(eq(transacciones.tipo, params.analisisTipo));
    }

    const filasAnalisis = await db
      .select()
      .from(transacciones)
      .where(and(...condicionesAnalisis))
      .orderBy(desc(transacciones.fecha), desc(transacciones.id));
    txParaAnalisis = filasAnalisis.map(mapearTransaccion);
  }

  const analisis = compilarAnalisis(
    analisisDesde,
    analisisHasta,
    txParaAnalisis,
    esAnualCompleta,
    tituloRangoAnalisis
  );

  const condicionesHistorial = [
    eq(transacciones.perfil_id, perfilActual.id),
    eq(transacciones.eliminado, false),
    between(transacciones.fecha, inicio, fin),
    gt(transacciones.monto, "0"),
  ];
  if (params.historialCategoria && params.historialCategoria !== "todas") {
    condicionesHistorial.push(
      eq(transacciones.categoria, params.historialCategoria)
    );
  }
  if (params.historialTipo === "ingreso" || params.historialTipo === "egreso") {
    condicionesHistorial.push(eq(transacciones.tipo, params.historialTipo));
  }
  const busqueda = (params.historialBusqueda ?? "").trim();
  if (busqueda) {
    const patron = `%${busqueda}%`;
    const filtroTexto = or(
      ilike(transacciones.descripcion, patron),
      ilike(transacciones.categoria, patron)
    );
    if (filtroTexto) condicionesHistorial.push(filtroTexto);
  }

  const filasHistorial = await db
    .select()
    .from(transacciones)
    .where(and(...condicionesHistorial))
    .orderBy(desc(transacciones.fecha), desc(transacciones.id))
    .limit(31);

  const filasPapelera = await db
    .select()
    .from(transacciones)
    .where(
      and(
        eq(transacciones.perfil_id, perfilActual.id),
        eq(transacciones.eliminado, true)
      )
    )
    .orderBy(desc(transacciones.creado_en), desc(transacciones.id))
    .limit(20);

  return {
    perfiles,
    perfil_actual: perfilActual,
    vista,
    fecha_ref: fechaRef,
    fecha_anterior: fechaAnterior,
    fecha_siguiente: fechaSiguiente,
    hoy_iso: hoyIso,
    inicio_periodo: inicio,
    fin_periodo: fin,
    titulo_periodo: tituloPeriodo,
    total_ingresos: Number(totalIngresos.toFixed(2)),
    total_egresos: Number(totalEgresos.toFixed(2)),
    balance_neto: Number(balanceNeto.toFixed(2)),
    comparativa_kpi: comparativaKpi,
    top_egreso_kpi: topEgresoKpi,
    categorias: todas,
    categorias_egreso: egresos,
    categorias_ingreso: ingresos,
    semanas_calendario: semanasCalendario,
    dias_semana_vista: diasSemanaVista,
    meses_anual: mesesAnual,
    datos_general: datosGeneral,
    transacciones_dia: vista === "dia" ? txPeriodo : [],
    transacciones_historial: filasHistorial.slice(0, 30).map(mapearTransaccion),
    hay_mas_historial: filasHistorial.length > 30,
    analisis,
    papelera: filasPapelera.map(mapearTransaccion),
    ajustes,
    textos,
  };
}
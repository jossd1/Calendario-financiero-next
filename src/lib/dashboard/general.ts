import { and, asc, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { categorias, perfiles, transacciones } from "@/db/schema";
import { MESES_ES, formatearFechaDMY } from "@/lib/format";
import { formatoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type {
  AnioDetalleItem,
  ComparativaAnualItem,
  DatosGeneralDTO,
  EvolucionMensualItem,
  RecordCategoriaItem,
  RecordMovimientoItem,
} from "@/types/general";

export async function compilarDatosGenerales(
  perfilId: number,
  monedaPerfil: string,
  consolidado: boolean,
  subperfilId: number | null = null
): Promise<DatosGeneralDTO> {
  const moneda = obtenerMonedaInfo(monedaPerfil).codigo;
  let perfilIdsIncluidos = [perfilId];
  let perfilesOmitidos = 0;

  if (consolidado) {
    const todosPerfiles = await db
      .select({ id: perfiles.id, moneda: perfiles.moneda })
      .from(perfiles);
    const mismaMoneda = todosPerfiles.filter(
      (p) => obtenerMonedaInfo(p.moneda).codigo === moneda
    );
    perfilIdsIncluidos =
      mismaMoneda.length > 0 ? mismaMoneda.map((p) => p.id) : [perfilId];
    perfilesOmitidos = Math.max(0, todosPerfiles.length - perfilIdsIncluidos.length);
  }

  const condicionPerfil = consolidado
    ? inArray(transacciones.perfil_id, perfilIdsIncluidos)
    : subperfilId
    ? and(
        eq(transacciones.perfil_id, perfilId),
        eq(transacciones.subperfil_id, subperfilId)
      )
    : eq(transacciones.perfil_id, perfilId);

  const filasTx = await db
    .select()
    .from(transacciones)
    .where(
      and(
        eq(transacciones.eliminado, false),
        gt(transacciones.monto, "0"),
        condicionPerfil
      )
    )
    .orderBy(asc(transacciones.fecha), asc(transacciones.id));

  const filasCat = consolidado
    ? await db
        .select()
        .from(categorias)
        .where(inArray(categorias.perfil_id, perfilIdsIncluidos))
    : await db
        .select()
        .from(categorias)
        .where(eq(categorias.perfil_id, perfilId));

  const colorMap = new Map<string, string>();
  for (const c of filasCat) {
    if (!colorMap.has(c.nombre)) colorMap.set(c.nombre, c.color ?? "#3b82f6");
  }

  let totalIngresos = 0;
  let totalEgresos = 0;
  const porMes = new Map<string, { etiqueta: string; ingresos: number; egresos: number }>();
  const porAnio = new Map<
    number,
    {
      ingresos: number;
      egresos: number;
      cantidad: number;
      mesesNeto: Map<string, number>;
      catsEgreso: Map<string, number>;
    }
  >();
  const egresosPorCat = new Map<string, number>();

  for (const r of filasTx) {
    const monto = Number(r.monto);
    const fechaIso = String(r.fecha);
    const [anioStr, mesStr] = fechaIso.split("-");
    const anio = Number(anioStr);
    const mes = Number(mesStr);
    const mesKey = `${anioStr}-${mesStr}`;
    const mesEtiqueta = `${MESES_ES[mes]?.slice(0, 3) ?? mesStr} ${anioStr}`;

    const bucketMes = porMes.get(mesKey) ?? {
      etiqueta: mesEtiqueta,
      ingresos: 0,
      egresos: 0,
    };
    const bucketAnio = porAnio.get(anio) ?? {
      ingresos: 0,
      egresos: 0,
      cantidad: 0,
      mesesNeto: new Map<string, number>(),
      catsEgreso: new Map<string, number>(),
    };

    bucketAnio.cantidad += 1;

    if (r.tipo === "ingreso") {
      totalIngresos += monto;
      bucketMes.ingresos += monto;
      bucketAnio.ingresos += monto;
      bucketAnio.mesesNeto.set(
        mesEtiqueta,
        (bucketAnio.mesesNeto.get(mesEtiqueta) ?? 0) + monto
      );
    } else {
      totalEgresos += monto;
      bucketMes.egresos += monto;
      bucketAnio.egresos += monto;
      bucketAnio.mesesNeto.set(
        mesEtiqueta,
        (bucketAnio.mesesNeto.get(mesEtiqueta) ?? 0) - monto
      );
      bucketAnio.catsEgreso.set(
        r.categoria,
        (bucketAnio.catsEgreso.get(r.categoria) ?? 0) + monto
      );
      egresosPorCat.set(r.categoria, (egresosPorCat.get(r.categoria) ?? 0) + monto);
    }

    porMes.set(mesKey, bucketMes);
    porAnio.set(anio, bucketAnio);
  }

  let acumulado = 0;
  const evolucionMensual: EvolucionMensualItem[] = [];
  let mejorMes: { etiqueta: string; neto: number } | null = null;
  let mesMayorGasto: { etiqueta: string; egresos: number } | null = null;

  for (const [mesKey, vals] of Array.from(porMes.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const neto = vals.ingresos - vals.egresos;
    acumulado += neto;
    evolucionMensual.push({
      mes_key: mesKey,
      etiqueta: vals.etiqueta,
      ingresos: Number(vals.ingresos.toFixed(2)),
      egresos: Number(vals.egresos.toFixed(2)),
      neto: Number(neto.toFixed(2)),
      acumulado: Number(acumulado.toFixed(2)),
    });

    if (!mejorMes || neto > mejorMes.neto) {
      mejorMes = { etiqueta: vals.etiqueta, neto: Number(neto.toFixed(2)) };
    }
    if (!mesMayorGasto || vals.egresos > mesMayorGasto.egresos) {
      mesMayorGasto = {
        etiqueta: vals.etiqueta,
        egresos: Number(vals.egresos.toFixed(2)),
      };
    }
  }

  const aniosAsc = Array.from(porAnio.entries()).sort((a, b) => a[0] - b[0]);
  const detalleAnualesAsc: AnioDetalleItem[] = aniosAsc.map(([anio, vals], idx) => {
    const neto = vals.ingresos - vals.egresos;
    const tasa =
      vals.ingresos > 0 ? Number(((neto / vals.ingresos) * 100).toFixed(1)) : 0;

    let crecimientoPct: number | null = null;
    if (idx > 0) {
      const prev = aniosAsc[idx - 1][1];
      const prevNeto = prev.ingresos - prev.egresos;
      if (prevNeto !== 0) {
        crecimientoPct = Number(
          (((neto - prevNeto) / Math.abs(prevNeto)) * 100).toFixed(1)
        );
      }
    }

    const mejorMesAnio = Array.from(vals.mesesNeto.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topCatAnio = Array.from(vals.catsEgreso.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      anio,
      ingresos: Number(vals.ingresos.toFixed(2)),
      egresos: Number(vals.egresos.toFixed(2)),
      neto: Number(neto.toFixed(2)),
      tasa_ahorro_pct: tasa,
      cantidad_movimientos: vals.cantidad,
      crecimiento_neto_pct: crecimientoPct,
      mejor_mes: mejorMesAnio
        ? { etiqueta: mejorMesAnio[0], neto: Number(mejorMesAnio[1].toFixed(2)) }
        : null,
      top_categoria: topCatAnio
        ? {
            nombre: topCatAnio[0],
            color: colorMap.get(topCatAnio[0]) ?? "#3b82f6",
            monto: Number(topCatAnio[1].toFixed(2)),
          }
        : null,
    };
  });

  const detalleAnuales = [...detalleAnualesAsc].reverse();
  const comparativaAnual: ComparativaAnualItem[] = detalleAnuales.map((a) => ({
    anio: a.anio,
    ingresos: a.ingresos,
    egresos: a.egresos,
    neto: a.neto,
    tasa_ahorro_pct: a.tasa_ahorro_pct,
  }));

  const topCategorias: RecordCategoriaItem[] = Array.from(egresosPorCat.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([categoria, monto]) => ({
      categoria,
      color: colorMap.get(categoria) ?? "#3b82f6",
      monto: Number(monto.toFixed(2)),
      porcentaje:
        totalEgresos > 0 ? Number(((monto / totalEgresos) * 100).toFixed(1)) : 0,
    }));

  const topMovimientos: RecordMovimientoItem[] = [...filasTx]
    .sort((a, b) => Number(b.monto) - Number(a.monto))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      fecha_fmt: formatearFechaDMY(String(r.fecha)),
      tipo: r.tipo === "ingreso" ? "ingreso" : "egreso",
      categoria: r.categoria,
      descripcion: r.descripcion ?? "",
      monto_fmt: formatoMoneda(Number(r.monto), moneda),
    }));

  const mesesActivos = Math.max(1, evolucionMensual.length);
  const netoTotal = totalIngresos - totalEgresos;

  return {
    consolidado,
    moneda,
    perfiles_incluidos: perfilIdsIncluidos.length,
    perfiles_omitidos: perfilesOmitidos,
    tasa_ahorro_pct:
      totalIngresos > 0
        ? Number(((netoTotal / totalIngresos) * 100).toFixed(1))
        : 0,
    cantidad_movimientos: filasTx.length,
    meses_activos: evolucionMensual.length,
    ingreso_mensual_prom: Number((totalIngresos / mesesActivos).toFixed(2)),
    egreso_mensual_prom: Number((totalEgresos / mesesActivos).toFixed(2)),
    ahorro_mensual_prom: Number((netoTotal / mesesActivos).toFixed(2)),
    mejor_mes: mejorMes,
    mes_mayor_gasto: mesMayorGasto,
    evolucion_mensual: evolucionMensual,
    comparativa_anual: comparativaAnual,
    detalle_anuales: detalleAnuales,
    top_categorias: topCategorias,
    top_movimientos: topMovimientos,
  };
}
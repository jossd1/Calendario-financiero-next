import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { categorias, transacciones } from "@/db/schema";
import { MESES_ES, formatearFechaDMY, formatoSoles } from "@/lib/format";
import type {
  ComparativaAnualItem,
  DatosGeneralDTO,
  EvolucionMensualItem,
  RecordCategoriaItem,
  RecordMovimientoItem,
} from "@/types/general";

export async function compilarDatosGenerales(
  perfilId: number,
  consolidado: boolean
): Promise<DatosGeneralDTO> {
  const condicionesTx = [
    eq(transacciones.eliminado, false),
    gt(transacciones.monto, "0"),
  ];
  if (!consolidado) {
    condicionesTx.push(eq(transacciones.perfil_id, perfilId));
  }

  const filasTx = await db
    .select()
    .from(transacciones)
    .where(and(...condicionesTx))
    .orderBy(asc(transacciones.fecha), asc(transacciones.id));

  const filasCat = consolidado
    ? await db.select().from(categorias)
    : await db
        .select()
        .from(categorias)
        .where(eq(categorias.perfil_id, perfilId));

  const colorMap = new Map<string, string>();
  for (const c of filasCat) {
    if (!colorMap.has(c.nombre)) {
      colorMap.set(c.nombre, c.color ?? "#3b82f6");
    }
  }

  let totalIngresos = 0;
  let totalEgresos = 0;

  const porMes = new Map<
    string,
    { etiqueta: string; ingresos: number; egresos: number }
  >();
  const porAnio = new Map<number, { ingresos: number; egresos: number }>();
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
    const bucketAnio = porAnio.get(anio) ?? { ingresos: 0, egresos: 0 };

    if (r.tipo === "ingreso") {
      totalIngresos += monto;
      bucketMes.ingresos += monto;
      bucketAnio.ingresos += monto;
    } else {
      totalEgresos += monto;
      bucketMes.egresos += monto;
      bucketAnio.egresos += monto;
      egresosPorCat.set(
        r.categoria,
        (egresosPorCat.get(r.categoria) ?? 0) + monto
      );
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

  const comparativaAnual: ComparativaAnualItem[] = Array.from(
    porAnio.entries()
  )
    .sort((a, b) => b[0] - a[0])
    .map(([anio, vals]) => {
      const neto = vals.ingresos - vals.egresos;
      const tasa =
        vals.ingresos > 0 ? Number(((neto / vals.ingresos) * 100).toFixed(1)) : 0;
      return {
        anio,
        ingresos: Number(vals.ingresos.toFixed(2)),
        egresos: Number(vals.egresos.toFixed(2)),
        neto: Number(neto.toFixed(2)),
        tasa_ahorro_pct: tasa,
      };
    });

  const topCategorias: RecordCategoriaItem[] = Array.from(
    egresosPorCat.entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([categoria, monto]) => ({
      categoria,
      color: colorMap.get(categoria) ?? "#3b82f6",
      monto: Number(monto.toFixed(2)),
      porcentaje:
        totalEgresos > 0
          ? Number(((monto / totalEgresos) * 100).toFixed(1))
          : 0,
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
      monto_fmt: formatoSoles(Number(r.monto)),
    }));

  const mesesActivos = Math.max(1, evolucionMensual.length);
  const netoTotal = totalIngresos - totalEgresos;
  const tasaAhorroPct =
    totalIngresos > 0
      ? Number(((netoTotal / totalIngresos) * 100).toFixed(1))
      : 0;

  return {
    consolidado,
    tasa_ahorro_pct: tasaAhorroPct,
    cantidad_movimientos: filasTx.length,
    meses_activos: evolucionMensual.length,
    ingreso_mensual_prom: Number((totalIngresos / mesesActivos).toFixed(2)),
    egreso_mensual_prom: Number((totalEgresos / mesesActivos).toFixed(2)),
    ahorro_mensual_prom: Number((netoTotal / mesesActivos).toFixed(2)),
    mejor_mes: mejorMes,
    mes_mayor_gasto: mesMayorGasto,
    evolucion_mensual: evolucionMensual,
    comparativa_anual: comparativaAnual,
    top_categorias: topCategorias,
    top_movimientos: topMovimientos,
  };
}
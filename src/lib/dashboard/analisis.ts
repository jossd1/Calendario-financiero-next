import { construirVistaAnual } from "@/lib/dashboard/calendario";
import { addDaysISO, formatearFechaCortaDM } from "@/lib/format";
import { formatoMoneda } from "@/lib/monedas";
import type {
  AnalisisResultadoDTO,
  CategoriaDTO,
  DesgloseCategoria,
  TopEgresoKpiDTO,
  TransaccionDTO,
} from "@/types";

export function calcularTopEgresoKpi(
  listaTx: TransaccionDTO[],
  totalEgresos: number,
  categorias: CategoriaDTO[],
  moneda = "PEN"
): TopEgresoKpiDTO | null {
  const mapa = new Map<string, { monto: number; cantidad: number }>();

  for (const tx of listaTx) {
    if (tx.tipo !== "egreso") continue;
    const actual = mapa.get(tx.categoria) ?? { monto: 0, cantidad: 0 };
    actual.monto += tx.monto;
    actual.cantidad += 1;
    mapa.set(tx.categoria, actual);
  }

  if (mapa.size === 0) return null;

  const ordenadas = Array.from(mapa.entries()).sort((a, b) => {
    if (b[1].monto !== a[1].monto) return b[1].monto - a[1].monto;
    if (b[1].cantidad !== a[1].cantidad) return b[1].cantidad - a[1].cantidad;
    return a[0].localeCompare(b[0], "es");
  });

  const [categoria, info] = ordenadas[0];
  const catObj = categorias.find((c) => c.nombre === categoria);
  const porcentaje =
    totalEgresos > 0
      ? Number(((info.monto / totalEgresos) * 100).toFixed(1))
      : 0;

  return {
    categoria,
    color: catObj?.color ?? "#ef4444",
    monto: Number(info.monto.toFixed(2)),
    monto_fmt: formatoMoneda(info.monto, moneda),
    porcentaje,
    cantidad: info.cantidad,
  };
}

export function compilarAnalisis(
  desde: string,
  hasta: string,
  listaTx: TransaccionDTO[],
  esVistaAnualCompleta: boolean,
  tituloRango: string,
  moneda = "PEN"
): AnalisisResultadoDTO {
  let totalIngresos = 0;
  let totalEgresos = 0;

  const egresosCatMap = new Map<string, number>();
  const ingresosCatMap = new Map<string, number>();

  for (const tx of listaTx) {
    if (tx.tipo === "ingreso") {
      totalIngresos += tx.monto;
      ingresosCatMap.set(
        tx.categoria,
        (ingresosCatMap.get(tx.categoria) ?? 0) + tx.monto
      );
    } else {
      totalEgresos += tx.monto;
      egresosCatMap.set(
        tx.categoria,
        (egresosCatMap.get(tx.categoria) ?? 0) + tx.monto
      );
    }
  }

  const egresosOrdenados = Array.from(egresosCatMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const ingresosOrdenados = Array.from(ingresosCatMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const desgloseEgresosPct: DesgloseCategoria[] = egresosOrdenados.map(
    ([categoria, val]) => ({
      categoria,
      tipo: "egreso",
      monto: Number(val.toFixed(2)),
      monto_fmt: formatoMoneda(val, moneda),
      porcentaje:
        totalEgresos > 0
          ? Number(((val / totalEgresos) * 100).toFixed(1))
          : 0,
    })
  );

  const desgloseIngresosPct: DesgloseCategoria[] = ingresosOrdenados.map(
    ([categoria, val]) => ({
      categoria,
      tipo: "ingreso",
      monto: Number(val.toFixed(2)),
      monto_fmt: formatoMoneda(val, moneda),
      porcentaje:
        totalIngresos > 0
          ? Number(((val / totalIngresos) * 100).toFixed(1))
          : 0,
    })
  );

  let flujoLabels: string[] = [];
  let flujoIngresos: number[] = [];
  let flujoEgresos: number[] = [];

  if (esVistaAnualCompleta) {
    const resumenAnual = construirVistaAnual(listaTx);
    flujoLabels = resumenAnual.map((m) => m.nombre.slice(0, 3));
    flujoIngresos = resumenAnual.map((m) => m.ingresos);
    flujoEgresos = resumenAnual.map((m) => m.egresos);
  } else {
    const porDia = new Map<string, { ingreso: number; egreso: number }>();
    let cursor = desde;
    let guard = 0;
    while (cursor <= hasta && guard < 400) {
      porDia.set(cursor, { ingreso: 0, egreso: 0 });
      cursor = addDaysISO(cursor, 1);
      guard += 1;
    }

    for (const tx of listaTx) {
      const bucket = porDia.get(tx.fecha_iso);
      if (bucket) bucket[tx.tipo] += tx.monto;
    }

    for (const [fechaIso, vals] of porDia.entries()) {
      flujoLabels.push(formatearFechaCortaDM(fechaIso));
      flujoIngresos.push(Number(vals.ingreso.toFixed(2)));
      flujoEgresos.push(Number(vals.egreso.toFixed(2)));
    }
  }

  return {
    desde,
    hasta,
    titulo_rango: tituloRango,
    total_ingresos: Number(totalIngresos.toFixed(2)),
    total_egresos: Number(totalEgresos.toFixed(2)),
    balance_neto: Number((totalIngresos - totalEgresos).toFixed(2)),
    chart_data: {
      categoriasLabels: egresosOrdenados.map(([cat]) => cat),
      categoriasValores: egresosOrdenados.map(([, val]) =>
        Number(val.toFixed(2))
      ),
      flujoLabels,
      flujoIngresos,
      flujoEgresos,
    },
    desglose_egresos_pct: desgloseEgresosPct,
    desglose_ingresos_pct: desgloseIngresosPct,
  };
}
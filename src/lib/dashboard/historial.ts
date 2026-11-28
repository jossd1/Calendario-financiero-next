import { and, between, desc, eq, gt, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import {
  buildIsoDate,
  daysInMonth,
  formatearFechaDMY,
  formatearHoraLima,
} from "@/lib/format";
import { formatoMoneda } from "@/lib/monedas";
import type { SubperfilDTO, TransaccionDTO } from "@/types";

export function mapearTransaccion(
  row: typeof transacciones.$inferSelect,
  moneda = "PEN",
  subperfilMap?: Map<number, SubperfilDTO>
): TransaccionDTO {
  const monto = Number(row.monto);
  const fechaIso = String(row.fecha);
  const sub =
    row.subperfil_id && subperfilMap
      ? subperfilMap.get(row.subperfil_id)
      : undefined;

  return {
    id: row.id,
    perfil_id: row.perfil_id,
    subperfil_id: row.subperfil_id ?? null,
    subperfil_nombre: sub ? `${sub.icono} ${sub.nombre}` : null,
    tipo: row.tipo === "ingreso" ? "ingreso" : "egreso",
    monto,
    monto_fmt: formatoMoneda(monto, moneda),
    categoria: row.categoria,
    descripcion: row.descripcion ?? "",
    fecha_iso: fechaIso,
    fecha_fmt: formatearFechaDMY(fechaIso),
    hora_fmt: formatearHoraLima(row.creado_en),
    estado:
      row.estado === "pendiente" || row.estado === "programado"
        ? row.estado
        : "pagado",
    eliminado: Boolean(row.eliminado),
  };
}

export async function obtenerHistorialYPapelera(params: {
  perfilId: number;
  subperfilId?: number | null;
  subperfilMap: Map<number, SubperfilDTO>;
  moneda?: string;
  inicio: string;
  fin: string;
  historialMes?: string | null;
  historialAnio?: string | null;
  sinLimiteHistorial?: boolean;
  categoria?: string | null;
  tipo?: string | null;
  busqueda?: string | null;
  incluirPendientes: boolean;
}) {
  const moneda = params.moneda ?? "PEN";

  let rangoInicio = params.inicio;
  let rangoFin = params.fin;
  const mesNum = Number(params.historialMes);
  const anioNum = Number(params.historialAnio);
  if (
    Number.isInteger(mesNum) &&
    mesNum >= 1 &&
    mesNum <= 12 &&
    Number.isInteger(anioNum) &&
    anioNum >= 1900 &&
    anioNum <= 3999
  ) {
    rangoInicio = buildIsoDate(anioNum, mesNum, 1);
    rangoFin = buildIsoDate(anioNum, mesNum, daysInMonth(anioNum, mesNum));
  }

  const condicionesHistorial = [
    eq(transacciones.perfil_id, params.perfilId),
    eq(transacciones.eliminado, false),
    between(transacciones.fecha, rangoInicio, rangoFin),
    gt(transacciones.monto, "0"),
  ];

  if (params.subperfilId) {
    condicionesHistorial.push(eq(transacciones.subperfil_id, params.subperfilId));
  }
  if (params.categoria && params.categoria !== "todas") {
    condicionesHistorial.push(eq(transacciones.categoria, params.categoria));
  }
  if (params.tipo === "ingreso" || params.tipo === "egreso") {
    condicionesHistorial.push(eq(transacciones.tipo, params.tipo));
  }
  const q = (params.busqueda ?? "").trim();
  if (q) {
    const patron = `%${q}%`;
    const filtroTexto = or(
      ilike(transacciones.descripcion, patron),
      ilike(transacciones.categoria, patron)
    );
    if (filtroTexto) condicionesHistorial.push(filtroTexto);
  }

  const limiteBase =
    params.sinLimiteHistorial || (mesNum >= 1 && mesNum <= 12) ? 500 : 30;

  const filasHistorial = await db
    .select()
    .from(transacciones)
    .where(and(...condicionesHistorial))
    .orderBy(desc(transacciones.fecha), desc(transacciones.id))
    .limit(limiteBase + 1);

  const filasPapelera = await db
    .select()
    .from(transacciones)
    .where(
      and(
        eq(transacciones.perfil_id, params.perfilId),
        eq(transacciones.eliminado, true)
      )
    )
    .orderBy(desc(transacciones.creado_en), desc(transacciones.id))
    .limit(20);

  const filasPendientes = params.incluirPendientes
    ? await db
        .select()
        .from(transacciones)
        .where(
          and(
            eq(transacciones.perfil_id, params.perfilId),
            eq(transacciones.eliminado, false),
            inArray(transacciones.estado, ["pendiente", "programado"])
          )
        )
        .orderBy(desc(transacciones.fecha), desc(transacciones.id))
        .limit(30)
    : [];

  return {
    transacciones_historial: filasHistorial
      .slice(0, limiteBase)
      .map((r) => mapearTransaccion(r, moneda, params.subperfilMap)),
    hay_mas_historial: filasHistorial.length > limiteBase,
    papelera: filasPapelera.map((r) =>
      mapearTransaccion(r, moneda, params.subperfilMap)
    ),
    pendientes_programados: filasPendientes.map((r) =>
      mapearTransaccion(r, moneda, params.subperfilMap)
    ),
  };
}

import { and, between, desc, eq, gt, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { formatearFechaDMY, formatearHoraLima, formatoSoles } from "@/lib/format";
import type { TransaccionDTO } from "@/types";

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
    estado:
      row.estado === "pendiente" || row.estado === "programado"
        ? row.estado
        : "pagado",
    eliminado: Boolean(row.eliminado),
  };
}

export async function obtenerHistorialYPapelera(params: {
  perfilId: number;
  inicio: string;
  fin: string;
  categoria?: string | null;
  tipo?: string | null;
  busqueda?: string | null;
  incluirPendientes: boolean;
}) {
  const condicionesHistorial = [
    eq(transacciones.perfil_id, params.perfilId),
    eq(transacciones.eliminado, false),
    between(transacciones.fecha, params.inicio, params.fin),
    gt(transacciones.monto, "0"),
  ];

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
    transacciones_historial: filasHistorial.slice(0, 30).map(mapearTransaccion),
    hay_mas_historial: filasHistorial.length > 30,
    papelera: filasPapelera.map(mapearTransaccion),
    pendientes_programados: filasPendientes.map(mapearTransaccion),
  };
}
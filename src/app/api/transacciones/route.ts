import { NextRequest, NextResponse } from "next/server";
import { and, between, desc, eq, gt, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { mapearTransaccion } from "@/lib/dashboard";
import { esFechaISOValida, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const offset = Math.max(0, Number(sp.get("offset") ?? "0") || 0);
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? "30") || 30));
    const desde = sp.get("desde");
    const hasta = sp.get("hasta");
    const tipo = sp.get("tipo");
    const categoria = sp.get("categoria");
    const q = (sp.get("q") ?? "").trim();

    const { perfilActual } = await obtenerPerfilActivo();

    const condiciones = [
      eq(transacciones.perfil_id, perfilActual.id),
      eq(transacciones.eliminado, false),
      gt(transacciones.monto, "0"),
    ];

    if (esFechaISOValida(desde) && esFechaISOValida(hasta)) {
      const d1 = desde <= hasta ? desde : hasta;
      const d2 = desde <= hasta ? hasta : desde;
      condiciones.push(between(transacciones.fecha, d1, d2));
    }

    if (tipo === "ingreso" || tipo === "egreso") {
      condiciones.push(eq(transacciones.tipo, tipo));
    }

    if (categoria && categoria !== "todas") {
      condiciones.push(eq(transacciones.categoria, categoria));
    }

    if (q) {
      const patron = `%${q}%`;
      const filtroTexto = or(
        ilike(transacciones.descripcion, patron),
        ilike(transacciones.categoria, patron)
      );
      if (filtroTexto) condiciones.push(filtroTexto);
    }

    const filas = await db
      .select()
      .from(transacciones)
      .where(and(...condiciones))
      .orderBy(desc(transacciones.fecha), desc(transacciones.id))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = filas.length > limit;
    const items = filas.slice(0, limit).map(mapearTransaccion);

    return NextResponse.json({
      ok: true,
      items,
      has_more: hasMore,
    });
  } catch (error) {
    console.error("Error en GET /api/transacciones:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudieron obtener las transacciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tipo = String(body.tipo ?? "egreso").trim().toLowerCase();
    const categoria = String(body.categoria ?? "").trim().slice(0, 60);
    const descripcion = String(body.descripcion ?? "").trim().slice(0, 240);
    const fechaStr = String(body.fecha ?? obtenerHoyPeruISO()).trim();
    const montoRaw = String(body.monto ?? "0").replace(",", ".");
    const montoNum = Number(montoRaw);

    if (
      (tipo !== "ingreso" && tipo !== "egreso") ||
      !categoria ||
      !esFechaISOValida(fechaStr) ||
      !Number.isFinite(montoNum) ||
      montoNum <= 0
    ) {
      return NextResponse.json(
        { ok: false, error: "Datos inválidos. Verifica monto, categoría y fecha." },
        { status: 400 }
      );
    }

    const montoFormateado = montoNum.toFixed(2);
    const { perfilActual } = await obtenerPerfilActivo();

    const [creada] = await db
      .insert(transacciones)
      .values({
        perfil_id: perfilActual.id,
        tipo,
        monto: montoFormateado,
        categoria,
        descripcion,
        fecha: fechaStr,
        eliminado: false,
      })
      .returning();

    return NextResponse.json({
      ok: true,
      id: creada.id,
      fecha_tx: fechaStr,
      mensaje: "Movimiento registrado con éxito.",
    });
  } catch (error) {
    console.error("Error en POST /api/transacciones:", error);
    return NextResponse.json(
      { ok: false, error: "Error al registrar la transacción." },
      { status: 500 }
    );
  }
}
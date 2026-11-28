import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { perfiles } from "@/db/schema";
import { obtenerMonedaInfo } from "@/lib/monedas";
import { asegurarCategoriasPerfil, PERFIL_COOKIE_NAME } from "@/lib/perfil";
import { asegurarSubperfilesPerfil } from "@/lib/subperfiles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre ?? "").trim().slice(0, 80);
    const monedaInfo = obtenerMonedaInfo(String(body.moneda ?? "PEN"));
    const descripcion = String(
      body.descripcion ?? `Cuenta en ${monedaInfo.nombre}`
    )
      .trim()
      .slice(0, 160);

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del perfil es obligatorio." },
        { status: 400 }
      );
    }

    const [{ total }] = await db.select({ total: count() }).from(perfiles);

    const [perfil] = await db
      .insert(perfiles)
      .values({
        nombre,
        descripcion: descripcion || `Cuenta en ${monedaInfo.nombre}`,
        moneda: monedaInfo.codigo,
        orden: Number(total),
      })
      .onConflictDoUpdate({
        target: perfiles.nombre,
        set: {
          descripcion: descripcion || `Cuenta en ${monedaInfo.nombre}`,
          moneda: monedaInfo.codigo,
        },
      })
      .returning();

    await asegurarCategoriasPerfil(perfil.id);
    await asegurarSubperfilesPerfil(perfil.id);

    const response = NextResponse.json({
      ok: true,
      perfil,
      mensaje: `Perfil '${nombre}' (${monedaInfo.codigo}) activado correctamente.`,
    });

    response.cookies.set(PERFIL_COOKIE_NAME, String(perfil.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Error en POST /api/perfiles:", error);
    return NextResponse.json(
      { ok: false, error: "Error al crear el perfil." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const ordenIds = Array.isArray(body.ordenIds)
      ? (body.ordenIds as unknown[]).map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : [];

    await db.transaction(async (tx) => {
      for (let idx = 0; idx < ordenIds.length; idx++) {
        await tx
          .update(perfiles)
          .set({ orden: idx })
          .where(eq(perfiles.id, ordenIds[idx]));
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en PATCH /api/perfiles:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo reordenar los perfiles." },
      { status: 500 }
    );
  }
}

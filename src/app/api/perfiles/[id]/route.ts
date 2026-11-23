import { NextRequest, NextResponse } from "next/server";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { perfiles } from "@/db/schema";
import { obtenerMonedaInfo } from "@/lib/monedas";
import { PERFIL_COOKIE_NAME } from "@/lib/perfil";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const perfilId = Number(id);
    if (!Number.isInteger(perfilId) || perfilId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de perfil inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nombre = String(body.nombre ?? "").trim().slice(0, 80);
    const descripcion = String(body.descripcion ?? "").trim().slice(0, 160);
    const moneda = obtenerMonedaInfo(String(body.moneda ?? "PEN")).codigo;

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del perfil es obligatorio." },
        { status: 400 }
      );
    }

    await db
      .update(perfiles)
      .set({ nombre, descripcion, moneda })
      .where(eq(perfiles.id, perfilId));

    return NextResponse.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error en PUT /api/perfiles/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al actualizar el perfil." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const perfilId = Number(id);
    if (!Number.isInteger(perfilId) || perfilId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de perfil inválido." },
        { status: 400 }
      );
    }

    const [{ total }] = await db.select({ total: count() }).from(perfiles);
    if (Number(total) <= 1) {
      return NextResponse.json(
        { ok: false, error: "No puedes eliminar el único perfil disponible." },
        { status: 400 }
      );
    }

    await db.delete(perfiles).where(eq(perfiles.id, perfilId));

    const cookiePerfil = request.cookies.get(PERFIL_COOKIE_NAME)?.value;
    const response = NextResponse.json({
      ok: true,
      mensaje: "Perfil y sus movimientos eliminados correctamente.",
    });

    if (Number(cookiePerfil) === perfilId) {
      const [restante] = await db
        .select({ id: perfiles.id })
        .from(perfiles)
        .orderBy(asc(perfiles.id))
        .limit(1);

      if (restante) {
        response.cookies.set(PERFIL_COOKIE_NAME, String(restante.id), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Error en DELETE /api/perfiles/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar el perfil." },
      { status: 500 }
    );
  }
}
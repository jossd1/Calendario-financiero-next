import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { subperfiles } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";
import { SUBPERFIL_COOKIE_NAME } from "@/lib/subperfiles";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const subId = Number(id);
    if (!Number.isInteger(subId) || subId <= 0) {
      return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();
    const nombre = String(body.nombre ?? "").trim().slice(0, 40);
    const atajo = String(body.atajo ?? "").trim().toLowerCase().slice(0, 10);
    const icono = String(body.icono ?? "💳").trim().slice(0, 10) || "💳";

    if (!nombre || !atajo) {
      return NextResponse.json(
        { ok: false, error: "Nombre y atajo son obligatorios." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();
    await db
      .update(subperfiles)
      .set({ nombre, atajo, icono })
      .where(
        and(eq(subperfiles.id, subId), eq(subperfiles.perfil_id, perfilActual.id))
      );

    return NextResponse.json({ ok: true, mensaje: "Subperfil actualizado." });
  } catch (error) {
    console.error("Error en PUT /api/subperfiles/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al actualizar subperfil." },
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
    const subId = Number(id);
    if (!Number.isInteger(subId) || subId <= 0) {
      return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 });
    }

    const { perfilActual } = await obtenerPerfilActivo();
    const [{ total }] = await db
      .select({ total: count() })
      .from(subperfiles)
      .where(eq(subperfiles.perfil_id, perfilActual.id));

    if (Number(total) <= 1) {
      return NextResponse.json(
        { ok: false, error: "Debes mantener al menos un subperfil." },
        { status: 400 }
      );
    }

    await db
      .delete(subperfiles)
      .where(
        and(eq(subperfiles.id, subId), eq(subperfiles.perfil_id, perfilActual.id))
      );

    const response = NextResponse.json({
      ok: true,
      mensaje: "Subperfil eliminado.",
    });
    if (Number(request.cookies.get(SUBPERFIL_COOKIE_NAME)?.value) === subId) {
      response.cookies.delete(SUBPERFIL_COOKIE_NAME);
    }
    return response;
  } catch (error) {
    console.error("Error en DELETE /api/subperfiles/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar subperfil." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { subperfiles } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";
import { SUBPERFIL_COOKIE_NAME } from "@/lib/subperfiles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "seleccionar") {
      const subId = body.subperfil_id === null ? null : Number(body.subperfil_id);
      const response = NextResponse.json({ ok: true });
      if (subId === null || !Number.isInteger(subId) || subId <= 0) {
        response.cookies.delete(SUBPERFIL_COOKIE_NAME);
      } else {
        response.cookies.set(SUBPERFIL_COOKIE_NAME, String(subId), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return response;
    }

    const nombre = String(body.nombre ?? "").trim().slice(0, 40);
    const atajoRaw = String(body.atajo ?? "").trim().toLowerCase().slice(0, 10);
    const icono = String(body.icono ?? "💳").trim().slice(0, 10) || "💳";

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del subperfil es obligatorio." },
        { status: 400 }
      );
    }

    const atajo = atajoRaw || nombre.slice(0, 1).toLowerCase();
    const { perfilActual } = await obtenerPerfilActivo();
    const [{ total }] = await db
      .select({ total: count() })
      .from(subperfiles)
      .where(eq(subperfiles.perfil_id, perfilActual.id));

    await db
      .insert(subperfiles)
      .values({
        perfil_id: perfilActual.id,
        nombre,
        atajo,
        icono,
        orden: Number(total),
      })
      .onConflictDoUpdate({
        target: [subperfiles.perfil_id, subperfiles.nombre],
        set: { atajo, icono },
      });

    return NextResponse.json({
      ok: true,
      mensaje: `Subperfil '${nombre}' [${atajo}] guardado.`,
    });
  } catch (error) {
    console.error("Error en POST /api/subperfiles:", error);
    return NextResponse.json(
      { ok: false, error: "Error al gestionar subperfil." },
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

    const { perfilActual } = await obtenerPerfilActivo();

    await db.transaction(async (tx) => {
      for (let idx = 0; idx < ordenIds.length; idx++) {
        await tx
          .update(subperfiles)
          .set({ orden: idx })
          .where(
            and(
              eq(subperfiles.id, ordenIds[idx]),
              eq(subperfiles.perfil_id, perfilActual.id)
            )
          );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en PATCH /api/subperfiles:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo reordenar los subperfiles." },
      { status: 500 }
    );
  }
}

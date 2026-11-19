import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { perfiles } from "@/db/schema";
import { PERFIL_COOKIE_NAME } from "@/lib/perfil";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const perfilId = Number(body.perfil_id);

    if (!Number.isInteger(perfilId) || perfilId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de perfil inválido." },
        { status: 400 }
      );
    }

    const [encontrado] = await db
      .select({ id: perfiles.id })
      .from(perfiles)
      .where(eq(perfiles.id, perfilId));

    if (!encontrado) {
      return NextResponse.json(
        { ok: false, error: "Perfil no encontrado." },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(PERFIL_COOKIE_NAME, String(encontrado.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Error en POST /api/perfiles/seleccionar:", error);
    return NextResponse.json(
      { ok: false, error: "Error al seleccionar el perfil." },
      { status: 500 }
    );
  }
}
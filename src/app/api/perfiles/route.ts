import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { perfiles } from "@/db/schema";
import { asegurarCategoriasPerfil, PERFIL_COOKIE_NAME } from "@/lib/perfil";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre ?? "").trim().slice(0, 80);
    const descripcion = String(
      body.descripcion ?? "Cuenta en Soles (S/)"
    )
      .trim()
      .slice(0, 160);

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del perfil es obligatorio." },
        { status: 400 }
      );
    }

    const [perfil] = await db
      .insert(perfiles)
      .values({
        nombre,
        descripcion: descripcion || "Cuenta en Soles (S/)",
        moneda: "PEN",
      })
      .onConflictDoUpdate({
        target: perfiles.nombre,
        set: { descripcion: descripcion || "Cuenta en Soles (S/)" },
      })
      .returning();

    await asegurarCategoriasPerfil(perfil.id);

    const response = NextResponse.json({
      ok: true,
      perfil,
      mensaje: `Perfil '${nombre}' activado correctamente.`,
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
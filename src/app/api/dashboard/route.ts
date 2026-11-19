import { estaAppBloqueada } from "@/lib/pin";
import { NextRequest, NextResponse } from "next/server";
import { compilarEstadoDashboard } from "@/lib/dashboard";

export async function GET(request: NextRequest) {
  try {
    if (await estaAppBloqueada()) {
  return NextResponse.json(
    { ok: false, error: "Sesión bloqueada por PIN." },
    { status: 401 }
  );
}
    const sp = request.nextUrl.searchParams;
    const estado = await compilarEstadoDashboard({
      vista: sp.get("vista"),
      fecha: sp.get("fecha"),
      analisisModo: sp.get("analisisModo"),
      analisisDesde: sp.get("analisisDesde"),
      analisisHasta: sp.get("analisisHasta"),
      analisisTipo: sp.get("analisisTipo"),
      historialCategoria: sp.get("historialCategoria"),
      historialTipo: sp.get("historialTipo"),
      historialBusqueda: sp.get("historialBusqueda"),
      generalConsolidado: sp.get("generalConsolidado"),
    });

    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    console.error("Error en GET /api/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error al cargar el estado del dashboard." },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { obtenerAjustesApp } from "@/lib/ajustes";
import {
  PIN_COOKIE_NAME,
  desactivarYBorrarPin,
  firmarTokenSesionPin,
  guardarPinYActivar,
  obtenerPinHashGuardado,
  verifyPinHash,
} from "@/lib/pin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "").trim();

    if (action === "activar") {
      const pin = String(body.pin ?? "").trim();
      if (!/^\d{4,6}$/.test(pin)) {
        return NextResponse.json(
          { ok: false, error: "El PIN debe tener entre 4 y 6 dígitos numéricos." },
          { status: 400 }
        );
      }

      const token = await guardarPinYActivar(pin);
      const { config } = await obtenerAjustesApp();
      const response = NextResponse.json({
        ok: true,
        config,
        mensaje: "PIN configurado y activado correctamente.",
      });
      response.cookies.set(PIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (action === "desactivar") {
      await desactivarYBorrarPin();
      const { config } = await obtenerAjustesApp();
      const response = NextResponse.json({
        ok: true,
        config,
        mensaje: "Bloqueo por PIN desactivado.",
      });
      response.cookies.delete(PIN_COOKIE_NAME);
      return response;
    }

    if (action === "verificar") {
      const pin = String(body.pin ?? "").trim();
      const hashGuardado = await obtenerPinHashGuardado();
      if (!hashGuardado || !verifyPinHash(pin, hashGuardado)) {
        return NextResponse.json(
          { ok: false, error: "PIN incorrecto." },
          { status: 401 }
        );
      }

      const token = firmarTokenSesionPin(hashGuardado);
      const response = NextResponse.json({ ok: true });
      response.cookies.set(PIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (action === "bloquear") {
      const response = NextResponse.json({ ok: true });
      response.cookies.delete(PIN_COOKIE_NAME);
      return response;
    }

    return NextResponse.json(
      { ok: false, error: "Acción no reconocida." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en POST /api/auth/pin:", error);
    return NextResponse.json(
      { ok: false, error: "Error en autenticación por PIN." },
      { status: 500 }
    );
  }
}
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ajustesApp } from "@/db/schema";
import {
  AJUSTES_DEFECTO,
  TEXTOS_UI_DEFECTO,
  guardarAjustesApp,
  obtenerAjustesApp,
} from "@/lib/ajustes";

export const PIN_COOKIE_NAME = "app_pin_unlocked";
const CLAVE_PIN_HASH = "auth_pin";

function getSessionSecret(): string {
  return (
    process.env.PIN_SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "calendario-financiero-local-secret-pen"
  );
}

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPinHash(pin: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derived = crypto.scryptSync(pin, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function firmarTokenSesionPin(pinHashStored: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(pinHashStored)
    .digest("hex");
}

export async function obtenerPinHashGuardado(): Promise<string | null> {
  const [fila] = await db
    .select()
    .from(ajustesApp)
    .where(eq(ajustesApp.clave, CLAVE_PIN_HASH));

  const hash = fila?.textos_json?.hash;
  return typeof hash === "string" && hash.includes(":") ? hash : null;
}

export async function estaAppBloqueada(): Promise<boolean> {
  const { config } = await obtenerAjustesApp();
  if (!config.authPinActivo || !config.pinConfigurado) {
    return false;
  }

  const hashGuardado = await obtenerPinHashGuardado();
  if (!hashGuardado) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(PIN_COOKIE_NAME)?.value;
  if (!token) return true;

  const esperado = firmarTokenSesionPin(hashGuardado);
  const a = Buffer.from(token);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return true;
  return !crypto.timingSafeEqual(a, b);
}

export async function guardarPinYActivar(pin: string): Promise<string> {
  const nuevoHash = hashPin(pin);

  await db
    .insert(ajustesApp)
    .values({
      clave: CLAVE_PIN_HASH,
      config_json: AJUSTES_DEFECTO,
      textos_json: { ...TEXTOS_UI_DEFECTO, hash: nuevoHash },
    })
    .onConflictDoUpdate({
      target: ajustesApp.clave,
      set: {
        textos_json: { hash: nuevoHash },
        actualizado_en: new Date(),
      },
    });

  await guardarAjustesApp({
    config: { authPinActivo: true, pinConfigurado: true },
  });

  return firmarTokenSesionPin(nuevoHash);
}

export async function desactivarYBorrarPin(): Promise<void> {
  await db.delete(ajustesApp).where(eq(ajustesApp.clave, CLAVE_PIN_HASH));
  await guardarAjustesApp({
    config: { authPinActivo: false, pinConfigurado: false },
  });
}
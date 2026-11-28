import { cookies } from "next/headers";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { subperfiles } from "@/db/schema";
import type { SubperfilDTO } from "@/types";

export const SUBPERFIL_COOKIE_NAME = "subperfil_id";

const SUBPERFILES_DEFECTO: ReadonlyArray<{
  nombre: string;
  atajo: string;
  icono: string;
  orden: number;
}> = [
  { nombre: "Digital", atajo: "d", icono: "📱", orden: 0 },
  { nombre: "Físico", atajo: "f", icono: "💵", orden: 1 },
];

function mapearSubperfil(row: typeof subperfiles.$inferSelect): SubperfilDTO {
  return {
    id: row.id,
    perfil_id: row.perfil_id,
    nombre: row.nombre,
    atajo: row.atajo,
    icono: row.icono ?? "💳",
    orden: row.orden ?? 0,
  };
}

export async function asegurarSubperfilesPerfil(perfilId: number): Promise<void> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(subperfiles)
    .where(eq(subperfiles.perfil_id, perfilId));

  if (Number(total) > 0) return;

  for (const item of SUBPERFILES_DEFECTO) {
    await db
      .insert(subperfiles)
      .values({
        perfil_id: perfilId,
        nombre: item.nombre,
        atajo: item.atajo,
        icono: item.icono,
        orden: item.orden,
      })
      .onConflictDoNothing({
        target: [subperfiles.perfil_id, subperfiles.nombre],
      });
  }
}

export async function obtenerSubperfilesPerfil(perfilId: number): Promise<{
  lista: SubperfilDTO[];
  subperfilActivoId: number | null;
}> {
  await asegurarSubperfilesPerfil(perfilId);

  const filas = await db
    .select()
    .from(subperfiles)
    .where(eq(subperfiles.perfil_id, perfilId))
    .orderBy(asc(subperfiles.orden), asc(subperfiles.id));

  const lista = filas.map(mapearSubperfil);

  const cookieStore = await cookies();
  const raw = cookieStore.get(SUBPERFIL_COOKIE_NAME)?.value;
  const parsed = raw ? Number(raw) : NaN;

  const encontrado =
    Number.isInteger(parsed) && parsed > 0
      ? lista.find((s) => s.id === parsed)
      : undefined;

  return {
    lista,
    subperfilActivoId: encontrado ? encontrado.id : null,
  };
}

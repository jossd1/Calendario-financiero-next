import type { CategoriaDTO, SubperfilDTO } from "@/types";

export interface ResultadoAtajo {
  monto: string | null;
  sufijo: string;
  cat: CategoriaDTO | null;
  subperfil: SubperfilDTO | null;
  subperfilInvalido: string | null;
}

export function analizarEntradaMonto(
  montoTexto: string,
  todasCategorias: CategoriaDTO[],
  subperfiles: SubperfilDTO[] = []
): ResultadoAtajo | null {
  const texto = montoTexto.trim();
  if (!texto) return null;

  const buscarCat = (suf: string) =>
    suf
      ? todasCategorias.find(
          (c) => Boolean(c.atajo) && c.atajo.trim().toLowerCase() === suf
        ) ?? null
      : null;

  const buscarSub = (tok: string) =>
    tok
      ? subperfiles.find(
          (s) => Boolean(s.atajo) && s.atajo.trim().toLowerCase() === tok
        ) ?? null
      : null;

  // Caso 1: Subperfil + espacio + monto + categoría (ej. "d 15al" o "1 15al")
  const mPrefijoEsp = texto.match(/^([a-zA-Z0-9]+)\s+(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
  if (mPrefijoEsp) {
    const subTok = mPrefijoEsp[1].toLowerCase();
    const monto = mPrefijoEsp[2].replace(",", ".");
    const sufijo = (mPrefijoEsp[3] ?? "").trim().toLowerCase();
    const sub = buscarSub(subTok);
    return {
      monto,
      sufijo,
      cat: buscarCat(sufijo),
      subperfil: sub,
      subperfilInvalido: sub ? null : subTok,
    };
  }

  // Caso 2: Monto + categoría + espacio + subperfil (ej. "15al d", "15 d", "15al 1")
  const mSufijoEsp = texto.match(/^(\d+(?:[.,]\d{1,2})?)\s*([a-zA-Z]*)\s+([a-zA-Z0-9]+)$/);
  if (mSufijoEsp) {
    const monto = mSufijoEsp[1].replace(",", ".");
    const sufijo = (mSufijoEsp[2] ?? "").trim().toLowerCase();
    const subTok = mSufijoEsp[3].toLowerCase();
    const sub = buscarSub(subTok);
    return {
      monto,
      sufijo,
      cat: buscarCat(sufijo),
      subperfil: sub,
      subperfilInvalido: sub ? null : subTok,
    };
  }

  // Caso 3: Prefijo pegado sin espacio (ej. "d15al") si coincide con subperfil
  const mPrefijoPegado = texto.match(/^([a-zA-Z]+)(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
  if (mPrefijoPegado) {
    const pref = mPrefijoPegado[1].toLowerCase();
    const sub = buscarSub(pref);
    if (sub) {
      const monto = mPrefijoPegado[2].replace(",", ".");
      const sufijo = (mPrefijoPegado[3] ?? "").trim().toLowerCase();
      return {
        monto,
        sufijo,
        cat: buscarCat(sufijo),
        subperfil: sub,
        subperfilInvalido: null,
      };
    }
  }

  // Caso 4: Clásico monto + atajo de categoría (ej. "15al" o "15")
  const match = texto.match(/^(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
  if (!match) {
    return {
      monto: null,
      sufijo: texto.toLowerCase(),
      cat: null,
      subperfil: null,
      subperfilInvalido: null,
    };
  }

  const monto = match[1].replace(",", ".");
  const sufijo = (match[2] ?? "").trim().toLowerCase();

  return {
    monto,
    sufijo,
    cat: buscarCat(sufijo),
    subperfil: null,
    subperfilInvalido: null,
  };
}

export type AppIconName =
  | "ajustes"
  | "perfilEngranaje"
  | "categorias"
  | "papelera"
  | "revertir"
  | "resumen";

export interface AppIconDef {
  src: string;
  fallback: string;
  alt: string;
}

export const APP_ICONS: Record<AppIconName, AppIconDef> = {
  ajustes: {
    src: "/icons/ajustes.svg",
    fallback: "⚙️",
    alt: "Ajustes",
  },
  perfilEngranaje: {
    src: "/icons/perfiles.svg",
    fallback: "⚙️",
    alt: "Administrar perfiles",
  },
  categorias: {
    src: "/icons/categorias.svg",
    fallback: "🏷️",
    alt: "Categorías",
  },
  papelera: {
    src: "/icons/papelera.svg",
    fallback: "🗑️",
    alt: "Papelera",
  },
  revertir: {
    src: "/icons/revertir.svg",
    fallback: "♻️",
    alt: "Revertir",
  },
  resumen: {
    src: "/icons/resumen.svg",
    fallback: "📋",
    alt: "Resumen",
  },
};

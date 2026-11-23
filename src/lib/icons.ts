export type AppIconName =
  | "ajustes"
  | "perfilEngranaje"
  | "categorias"
  | "papelera";

export interface AppIconDef {
  src: string;
  fallback: string;
  alt: string;
}

/**
 * Coloca tus archivos .svg dentro de: public/icons/
 * Si usas otros nombres de archivo, solo cambia la ruta `src` aquí.
 */
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
};
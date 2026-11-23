export interface MonedaDef {
  codigo: string;
  simbolo: string;
  nombre: string;
}

export const MONEDAS_DISPONIBLES: ReadonlyArray<MonedaDef> = [
  { codigo: "PEN", simbolo: "S/", nombre: "Sol peruano (Perú)" },
  { codigo: "USD", simbolo: "$", nombre: "Dólar estadounidense (EE. UU. / EC / SV / PA)" },
  { codigo: "MXN", simbolo: "MX$", nombre: "Peso mexicano (México)" },
  { codigo: "COP", simbolo: "COP$", nombre: "Peso colombiano (Colombia)" },
  { codigo: "ARS", simbolo: "AR$", nombre: "Peso argentino (Argentina)" },
  { codigo: "CLP", simbolo: "CLP$", nombre: "Peso chileno (Chile)" },
  { codigo: "EUR", simbolo: "€", nombre: "Euro (España)" },
  { codigo: "UYU", simbolo: "$U", nombre: "Peso uruguayo (Uruguay)" },
  { codigo: "PYG", simbolo: "₲", nombre: "Guaraní (Paraguay)" },
  { codigo: "BOB", simbolo: "Bs", nombre: "Boliviano (Bolivia)" },
  { codigo: "VES", simbolo: "Bs.D", nombre: "Bolívar (Venezuela)" },
  { codigo: "GTQ", simbolo: "Q", nombre: "Quetzal (Guatemala)" },
  { codigo: "HNL", simbolo: "L", nombre: "Lempira (Honduras)" },
  { codigo: "NIO", simbolo: "C$", nombre: "Córdoba (Nicaragua)" },
  { codigo: "CRC", simbolo: "₡", nombre: "Colón (Costa Rica)" },
  { codigo: "PAB", simbolo: "B/.", nombre: "Balboa (Panamá)" },
  { codigo: "DOP", simbolo: "RD$", nombre: "Peso dominicano (Rep. Dominicana)" },
  { codigo: "CUP", simbolo: "CUP$", nombre: "Peso cubano (Cuba)" },
  { codigo: "XAF", simbolo: "FCFA", nombre: "Franco CFA (Guinea Ecuatorial)" },
];

export function obtenerMonedaInfo(codigo?: string | null): MonedaDef {
  const norm = String(codigo ?? "PEN").trim().toUpperCase();
  return (
    MONEDAS_DISPONIBLES.find((m) => m.codigo === norm) ??
    MONEDAS_DISPONIBLES[0]
  );
}

export function esMonedaValida(codigo: string): boolean {
  const norm = codigo.trim().toUpperCase();
  return MONEDAS_DISPONIBLES.some((m) => m.codigo === norm);
}

export function formatoMoneda(
  valor: number | string | null | undefined,
  codigoMoneda?: string | null
): string {
  const { simbolo } = obtenerMonedaInfo(codigoMoneda);
  const numero = Number(valor ?? 0);
  const seguro = Number.isFinite(numero) ? numero : 0;
  const signo = seguro < 0 ? "-" : "";
  const formateado = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(seguro));
  return `${signo}${simbolo} ${formateado}`;
}

export function mostrarMontoMoneda(
  textoFormateado: string,
  modoPrivacidad: boolean,
  codigoMoneda?: string | null,
  prefijoSigno = ""
): string {
  if (modoPrivacidad) {
    const { simbolo } = obtenerMonedaInfo(codigoMoneda);
    return `${prefijoSigno}${simbolo} •••`;
  }
  return `${prefijoSigno}${textoFormateado}`;
}
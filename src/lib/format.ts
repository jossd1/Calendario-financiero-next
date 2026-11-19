import type { TipoMovimiento } from "@/types";

export const MESES_ES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const DIAS_SEMANA_ES = [
  "Dom",
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
] as const;

export const CATEGORIAS_DEFECTO: ReadonlyArray<{
  nombre: string;
  tipo: TipoMovimiento;
  atajo: string;
  color: string;
}> = [
  { nombre: "Salario", tipo: "ingreso", atajo: "sa", color: "#10b981" },
  { nombre: "Freelance", tipo: "ingreso", atajo: "fr", color: "#06b6d4" },
  { nombre: "Otros Ingresos", tipo: "ingreso", atajo: "oi", color: "#84cc16" },
  { nombre: "Alimentación", tipo: "egreso", atajo: "al", color: "#f59e0b" },
  { nombre: "Vivienda", tipo: "egreso", atajo: "vi", color: "#8b5cf6" },
  { nombre: "Transporte", tipo: "egreso", atajo: "tr", color: "#ec4899" },
  { nombre: "Servicios", tipo: "egreso", atajo: "se", color: "#f97316" },
  { nombre: "Salud", tipo: "egreso", atajo: "sl", color: "#ef4444" },
  { nombre: "Educación", tipo: "egreso", atajo: "ed", color: "#3b82f6" },
  { nombre: "Entretenimiento", tipo: "egreso", atajo: "en", color: "#e11d48" },
  { nombre: "Otros Gastos", tipo: "egreso", atajo: "og", color: "#64748b" },
];

export function formatoSoles(valor: number | string | null | undefined): string {
  const numero = Number(valor ?? 0);
  const seguro = Number.isFinite(numero) ? numero : 0;
  const signo = seguro < 0 ? "-" : "";
  const formateado = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(seguro));
  return `${signo}S/ ${formateado}`;
}

export function mostrarMonto(
  textoFormateado: string,
  modoPrivacidad: boolean,
  prefijoSigno = ""
): string {
  if (modoPrivacidad) {
    return `${prefijoSigno}S/ •••`;
  }
  return `${prefijoSigno}${textoFormateado}`;
}

export function obtenerHoyPeruISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function esFechaISOValida(valor: string | null | undefined): valor is string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [y, m, d] = valor.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseIsoDateParts(iso: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function buildIsoDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDaysISO(iso: string, deltaDays: number): string {
  const { year, month, day } = parseIsoDateParts(iso);
  const dt = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return buildIsoDate(
    dt.getUTCFullYear(),
    dt.getUTCMonth() + 1,
    dt.getUTCDate()
  );
}

export function addMonthsISO(iso: string, deltaMonths: number): string {
  const { year, month } = parseIsoDateParts(iso);
  const dt = new Date(Date.UTC(year, month - 1 + deltaMonths, 1));
  return buildIsoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1);
}

export function formatearFechaDMY(iso: string): string {
  if (!esFechaISOValida(iso)) return iso;
  const { year, month, day } = parseIsoDateParts(iso);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function formatearFechaCortaDM(iso: string): string {
  if (!esFechaISOValida(iso)) return iso;
  const { month, day } = parseIsoDateParts(iso);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

export function formatearHoraLima(fecha: Date | string | null | undefined): string {
  if (!fecha) return "";
  const dt = typeof fecha === "string" ? new Date(fecha) : fecha;
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dt);
}
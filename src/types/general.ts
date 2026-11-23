import type { TipoMovimiento } from "@/types";

export interface EvolucionMensualItem {
  mes_key: string;
  etiqueta: string;
  ingresos: number;
  egresos: number;
  neto: number;
  acumulado: number;
}

export interface ComparativaAnualItem {
  anio: number;
  ingresos: number;
  egresos: number;
  neto: number;
  tasa_ahorro_pct: number;
}

export interface AnioDetalleItem extends ComparativaAnualItem {
  cantidad_movimientos: number;
  crecimiento_neto_pct: number | null;
  mejor_mes: { etiqueta: string; neto: number } | null;
  top_categoria: { nombre: string; color: string; monto: number } | null;
}

export interface RecordCategoriaItem {
  categoria: string;
  color: string;
  monto: number;
  porcentaje: number;
}

export interface RecordMovimientoItem {
  id: number;
  fecha_fmt: string;
  tipo: TipoMovimiento;
  categoria: string;
  descripcion: string;
  monto_fmt: string;
}

export interface DatosGeneralDTO {
  consolidado: boolean;
  moneda: string;
  perfiles_incluidos: number;
  perfiles_omitidos: number;
  tasa_ahorro_pct: number;
  cantidad_movimientos: number;
  meses_activos: number;
  ingreso_mensual_prom: number;
  egreso_mensual_prom: number;
  ahorro_mensual_prom: number;
  mejor_mes: { etiqueta: string; neto: number } | null;
  mes_mayor_gasto: { etiqueta: string; egresos: number } | null;
  evolucion_mensual: EvolucionMensualItem[];
  comparativa_anual: ComparativaAnualItem[];
  detalle_anuales: AnioDetalleItem[];
  top_categorias: RecordCategoriaItem[];
  top_movimientos: RecordMovimientoItem[];
}
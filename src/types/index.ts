import type { DatosGeneralDTO } from "@/types/general";

export type TipoMovimiento = "ingreso" | "egreso";
export type EstadoMovimiento = "pagado" | "pendiente" | "programado";
export type VistaCalendario = "dia" | "semana" | "mensual" | "anual" | "general";
export type ModoCalendarioClick = "precargar" | "ver_dia" | "analizar_dia";
export type ModoAnalisis = "auto" | "manual";

export interface AjustesAppConfig {
  configVersion?: number;
  modoPrivacidad: boolean;
  comparativasKpi: boolean;
  kpiTopEgreso: boolean;
  vistaSemanal: boolean;
  vistaGeneral: boolean;
  hoverPreviewDia: boolean;
  mostrarNetoCeldas: boolean;
  limitarAniosCalendario: boolean;
  categoriaPredeterminada: string;
  alertaTopeDiario: number;
  densidad: "comoda" | "compacta";
  generalMostrarAhorro: boolean;
  generalMostrarEvolucion: boolean;
  generalMostrarRecords: boolean;
  generalMostrarAnual: boolean;
  generalPermitirConsolidado: boolean;
  presupuestosActivos: boolean;
  programadosActivos: boolean;
  modoPresupuesto: "base_mensual" | "por_mes";
  sumarProgramadosEnKpi: boolean;
  authPinActivo: boolean;
  pinConfigurado: boolean;
}

export type TextosUI = Record<string, string>;

export interface PerfilDTO {
  id: number;
  nombre: string;
  descripcion: string;
  moneda: string;
  creado_en: string;
}

export interface CategoriaDTO {
  id: number;
  perfil_id: number;
  nombre: string;
  tipo: TipoMovimiento;
  atajo: string;
  color: string;
}

export interface TransaccionDTO {
  id: number;
  perfil_id: number;
  tipo: TipoMovimiento;
  monto: number;
  monto_fmt: string;
  categoria: string;
  descripcion: string;
  fecha_iso: string;
  fecha_fmt: string;
  hora_fmt: string;
  estado: EstadoMovimiento;
  eliminado: boolean;
}

export interface PresupuestoItemDTO {
  id: number;
  mes_anio: string;
  categoria: string;
  color: string;
  limite: number;
  gastado: number;
  restante: number;
  porcentaje: number;
}

export interface CeldaCalendario {
  fecha_iso: string;
  dia: number;
  es_mes_actual: boolean;
  es_hoy: boolean;
  ingresos: number;
  egresos: number;
  neto: number;
  cantidad: number;
  top_items: TransaccionDTO[];
}

export interface DiaSemanaDetalle {
  fecha_iso: string;
  dia_nombre: string;
  fecha_corta: string;
  es_hoy: boolean;
  ingresos: number;
  egresos: number;
  neto: number;
  items: TransaccionDTO[];
}

export interface MesAnual {
  mes: number;
  nombre: string;
  ingresos: number;
  egresos: number;
  neto: number;
  cantidad: number;
}

export interface ComparativaKpiDTO {
  ingresos_anterior: number;
  egresos_anterior: number;
  balance_anterior: number;
  ingresos_pct_delta: number | null;
  egresos_pct_delta: number | null;
  balance_diff: number;
}

export interface TopEgresoKpiDTO {
  categoria: string;
  color: string;
  monto: number;
  monto_fmt: string;
  porcentaje: number;
  cantidad: number;
}

export interface DesgloseCategoria {
  categoria: string;
  tipo: TipoMovimiento;
  monto: number;
  monto_fmt: string;
  porcentaje: number;
}

export interface ChartDataDTO {
  categoriasLabels: string[];
  categoriasValores: number[];
  flujoLabels: string[];
  flujoIngresos: number[];
  flujoEgresos: number[];
}

export interface AnalisisResultadoDTO {
  desde: string;
  hasta: string;
  titulo_rango: string;
  total_ingresos: number;
  total_egresos: number;
  balance_neto: number;
  chart_data: ChartDataDTO;
  desglose_egresos_pct: DesgloseCategoria[];
  desglose_ingresos_pct: DesgloseCategoria[];
}

export interface DashboardEstadoDTO {
  perfiles: PerfilDTO[];
  perfil_actual: PerfilDTO;
  vista: VistaCalendario;
  fecha_ref: string;
  fecha_anterior: string;
  fecha_siguiente: string;
  hoy_iso: string;
  inicio_periodo: string;
  fin_periodo: string;
  titulo_periodo: string;
  total_ingresos: number;
  total_egresos: number;
  balance_neto: number;
  comparativa_kpi: ComparativaKpiDTO | null;
  top_egreso_kpi: TopEgresoKpiDTO | null;
  categorias: CategoriaDTO[];
  categorias_egreso: CategoriaDTO[];
  categorias_ingreso: CategoriaDTO[];
  semanas_calendario: CeldaCalendario[][] | null;
  dias_semana_vista: DiaSemanaDetalle[] | null;
  meses_anual: MesAnual[] | null;
  datos_general: DatosGeneralDTO | null;
  transacciones_dia: TransaccionDTO[];
  transacciones_historial: TransaccionDTO[];
  hay_mas_historial: boolean;
  analisis: AnalisisResultadoDTO;
  presupuestos: PresupuestoItemDTO[];
  pendientes_programados: TransaccionDTO[];
  papelera: TransaccionDTO[];
  ajustes: AjustesAppConfig;
  textos: TextosUI;
}

export interface FlashMensaje {
  id: string;
  tipo: "success" | "error";
  texto: string;
}

export * from "@/types/general";
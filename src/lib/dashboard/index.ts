export {
  calcularTopEgresoKpi,
  compilarAnalisis,
} from "@/lib/dashboard/analisis";
export {
  construirCalendarioMensual,
  construirVistaAnual,
  construirVistaSemanal,
} from "@/lib/dashboard/calendario";
export { compilarDatosGenerales } from "@/lib/dashboard/general";
export {
  mapearTransaccion,
  obtenerHistorialYPapelera,
} from "@/lib/dashboard/historial";
export {
  calcularNavegacionPeriodo,
  calcularRangoPeriodo,
  calcularRangoPeriodoAnterior,
} from "@/lib/dashboard/periodos";
export { compilarPresupuestos } from "@/lib/dashboard/presupuestos";
export {
  compilarEstadoDashboard,
  type CompilarDashboardParams,
} from "@/lib/dashboard/queries";
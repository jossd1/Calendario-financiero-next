export {
  calcularTopEgresoKpi,
  compilarAnalisis,
} from "@/lib/dashboard/analisis";
export {
  construirCalendarioMensual,
  construirVistaAnual,
  construirVistaSemanal,
} from "@/lib/dashboard/calendario";
export {
  calcularNavegacionPeriodo,
  calcularRangoPeriodo,
  calcularRangoPeriodoAnterior,
} from "@/lib/dashboard/periodos";
export {
  compilarEstadoDashboard,
  mapearTransaccion,
  type CompilarDashboardParams,
} from "@/lib/dashboard/queries";

export { compilarDatosGenerales } from "@/lib/dashboard/general";
export { compilarPresupuestos } from "@/lib/dashboard/presupuestos";
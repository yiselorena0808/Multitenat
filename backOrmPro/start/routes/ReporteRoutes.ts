import Route from "@adonisjs/core/services/router"
import ReportesController from "../../app/controller/ReporteController.js"
import AuthJwtMiddleware from "#middleware/auth_jwt"

const reporte = new ReportesController()
const authJwt = new AuthJwtMiddleware()

Route.post('/crearReporte', reporte.crearReporte).use(authJwt.handle.bind(authJwt))
Route.get('/listarReportes', reporte.listarReportes).use(authJwt.handle.bind(authJwt))
Route.get('/idReporte/:id', reporte.listarReporteId).use(authJwt.handle.bind(authJwt))
Route.put('/actualizarReporte/:id', reporte.actualizarReporte).use(authJwt.handle.bind(authJwt))
Route.delete('/eliminarReporte/:id', reporte.eliminarReporte).use(authJwt.handle.bind(authJwt))
Route.get('/listarUsu', reporte.listarMisReportes).use(authJwt.handle.bind(authJwt))
Route.get('/listarMio/:id', reporte.mostarMio).use(authJwt.handle.bind(authJwt))
Route.get('/listarReportesGeneral', reporte.listarGeneral).use(authJwt.handle.bind(authJwt))
Route.get('/reportesExcel', reporte.exportarReportesExcel).use(authJwt.handle.bind(authJwt))
Route.put('/actualizarEstadoConHuella', reporte.actualizarEstadoConHuella).use(authJwt.handle.bind(authJwt))
Route.post('/verificarReporteSGVA/:id', reporte.verificarReporteSGVA).use(authJwt.handle.bind(authJwt))
Route.get('/notificaciones', reporte.obtenerNotificaciones).use(authJwt.handle.bind(authJwt))
Route.get('/notificaciones/contador', reporte.obtenerContadorNotificaciones).use(authJwt.handle.bind(authJwt))
Route.put('/notificaciones/leer-todas', reporte.marcarTodasLeidas).use(authJwt.handle.bind(authJwt))
Route.put('/notificaciones/:id/leer', reporte.marcarNotificacionLeida).use(authJwt.handle.bind(authJwt))
Route.delete('/notificaciones/:id', reporte.eliminarNotificacion).use(authJwt.handle.bind(authJwt))
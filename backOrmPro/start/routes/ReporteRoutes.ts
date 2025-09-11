import Route from "@adonisjs/core/services/router"
import ReportesController from "../../app/controller/ReporteController.js"
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"

const reporte = new ReportesController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()

Route.post('/crearReporte', reporte.crearReporte).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/listarReportes', reporte.listarReportes).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/idReporte/:id', reporte.listarReporteId).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.put('/actualizarReporte/:id', reporte.actualizarReporte).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.delete('/eliminarReporte/:id', reporte.eliminarReporte).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/conteoReportes', reporte.conteoReportes).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])

import Route from "@adonisjs/core/services/router"
import ActividadesLudicasController from "../../app/controller/ActividadLudicaController.js"
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"


const actividad = new ActividadesLudicasController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()





Route.post('/crearActividadLudica', actividad.crearActividad).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/listarActividadesLudicas', actividad.listarActividades).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/idActividadLudica/:id', actividad.listarIdActividad).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.delete('/eliminarActividadLudica/:id', actividad.eliminarActividad).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.put('/actualizarActividadLudica/:id', actividad.actualzarActividad).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])


import Route from "@adonisjs/core/services/router"
import GestionController from "../../app/controller/GestionEppController.js"
import areaMiddleware from "../../app/middleware/AreaMiddleware.js"
import empresaMiddleware from "../../app/middleware/EmpresaMildeware.js"



const gestion = new GestionController()
const area = new areaMiddleware()
const empresa = new empresaMiddleware()


Route.group(() => {
Route.post('/crearGestion', gestion.crearGestion)//.use(authJwt.handle.bind(authJwt))
Route.get('/listarGestiones', gestion.listarGestiones)//.use(authJwt.handle.bind(authJwt))
Route.put('/actualizarEstadoGestion/:id', gestion.actualizarEstado)//.use(authJwt.handle.bind(authJwt))
Route.delete('/eliminarGestion/:id', gestion.eliminarGestion)//.use(authJwt.handle.bind(authJwt))
}).middleware([empresa.handle.bind(empresa), area.handle.bind(area)])

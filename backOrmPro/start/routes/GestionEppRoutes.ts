import Route from "@adonisjs/core/services/router"
import GestionController from "../../app/controller/GestionEppController.js"
import AuthJwtMiddleware from "#middleware/auth_jwt"



const gestion = new GestionController()
const authJwt = new AuthJwtMiddleware()


Route.group(() => {
Route.post('/crearGestion', gestion.crearGestion)
Route.get('/listarGestiones', gestion.listarGestiones)
Route.put('/actualizarEstadoGestion/:id', gestion.actualizarGestion)
Route.delete('/eliminarGestion/:id', gestion.eliminarGestion)
Route.get('/listarGestionId/:id', gestion.listarGestionPorId)
Route.get('/listarGestions', gestion.listarMisGestiones)
Route.get('/listarGestionesGeneral', gestion.listarGeneral)
Route.get('/GestionesExcel', gestion.exportarGestionesExcel)
}).use(authJwt.handle.bind(authJwt))

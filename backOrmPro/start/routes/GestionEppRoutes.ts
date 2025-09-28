import Route from "@adonisjs/core/services/router"
import GestionController from "../../app/controller/GestionEppController.js"
import AuthJwtMiddleware from "#middleware/auth_jwt"



const gestion = new GestionController()
const authJwt = new AuthJwtMiddleware()


Route.group(() => {
Route.post('/crearGestion', gestion.crearGestion)
Route.get('/listarGestiones', gestion.listarGestiones)
Route.put('/actualizarEstadoGestion/:id', gestion.actualizarEstado)
Route.delete('/eliminarGestion/:id', gestion.eliminarGestion)
}).use(authJwt.handle.bind(authJwt))

import Route from "@adonisjs/core/services/router"
import ActividadesLudicasController from "../../app/controller/ActividadLudicaController.js"
import AuthJwt from "../../app/middleware/auth_jwt.js"


const actividad = new ActividadesLudicasController()
const authJwt = new AuthJwt()

Route.get('/listarActividadesLudicas', actividad.listarIdActividad).use(authJwt.handle.bind(authJwt))
Route.post('/crearActividadLudica', actividad.crearActividad).use(authJwt.handle.bind(authJwt))
Route.put('/actualizarActividadLudica/:id', actividad.actualizarActividad).use(authJwt.handle.bind(authJwt))
Route.delete('/eliminarActividadLudica/:id', actividad.eliminarActividad).use(authJwt.handle.bind(authJwt))


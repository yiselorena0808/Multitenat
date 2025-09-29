import Route from "@adonisjs/core/services/router"
import ActividadesLudicasController from "../../app/controller/ActividadLudicaController.js"
import AuthJwtMiddleware from "../../app/middleware/auth_jwt.js"


const actividad = new ActividadesLudicasController()
const authJwt = new AuthJwtMiddleware()

Route.get('/listarActividadesLudicas', actividad.listar).use(authJwt.handle.bind(authJwt))
Route.post('/crearActividadLudica', actividad.crearActividad).use(authJwt.handle.bind(authJwt))
Route.put('/actualizarActividadLudica/:id', actividad.actualizar).use(authJwt.handle.bind(authJwt))
Route.delete('/eliminarActividadLudica/:id', actividad.eliminar).use(authJwt.handle.bind(authJwt))


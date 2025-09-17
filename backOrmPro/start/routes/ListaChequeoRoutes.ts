import Route from "@adonisjs/core/services/router"
import ListaChequeoController from "../../app/controller/ListaChequeoController.js"
import AuthJwtMiddleware from "#middleware/auth_jwt"

const lista = new ListaChequeoController()
const authJwt = new AuthJwtMiddleware()

Route.post('/crearListaChequeo', lista.crear).use(authJwt.handle.bind(authJwt))
Route.get('/listarListasChequeo', lista.listar).use(authJwt.handle.bind(authJwt))
Route.get('/listarListaChequeo/:id', lista.listarPorId).use(authJwt.handle.bind(authJwt))
Route.put('/actualizarListaChequeo/:id', lista.actualizar).use(authJwt.handle.bind(authJwt))
Route.delete('/eliminarListaChequeo/:id', lista.eliminar).use(authJwt.handle.bind(authJwt))

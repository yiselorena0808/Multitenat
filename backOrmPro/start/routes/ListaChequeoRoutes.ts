import Route from "@adonisjs/core/services/router"
import ListaChequeoController from "../../app/controller/ListaChequeoController.js"
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"

const lista = new ListaChequeoController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()

Route.post('/crearListaChequeo', lista.crearLista).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/listarListasChequeo', lista.listarListas).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.put('/actualizarListaChequeo/:id', lista.actualizarLista).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.delete('/eliminarListaChequeo/:id', lista.eliminarLista).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])

import Router from "@adonisjs/core/services/router"
import UsuariosController from "../../app/controller/UsuarioController.js"
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"
const usuario = new UsuariosController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()

// Rutas protegidas con JWT
Router.get('/listarUsuarios', usuario.listarUsuarios).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Router.get('/idUsuario/:id', usuario.listarUsuarioId).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Router.put('/actualizarUsuario/:id', usuario.actualizarUsuario).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Router.delete('/eliminarUsuario/:id', usuario.eliminarUsuario).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Router.get('/conteoUsuarios', usuario.conteoUsuarios).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])

// Rutas públicas
Router.post('/register', usuario.register) // Aquí se espera que llegue idTenant y idArea
Router.post('/login', usuario.login)

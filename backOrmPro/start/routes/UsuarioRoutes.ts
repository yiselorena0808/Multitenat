import Router from "@adonisjs/core/services/router"
import UsuariosController from "../../app/controller/UsuarioController.js"
import AuthJwt from "#middleware/auth_jwt"

const usuario = new UsuariosController()
const authJwt = new AuthJwt()

Router.post('/register',usuario.register)
Router.post('/login', usuario.login)
Router.get('/usuarios/:id', usuario.listarUsuarioId).use(authJwt.handle.bind(authJwt))
Router.get('/listarUsuarios/:id_empresa', usuario.listarUsuariosPorEmpresa).use(authJwt.handle.bind(authJwt))
Router.put('/actualizarUsuario/:id', usuario.actualizarUsuario).use(authJwt.handle.bind(authJwt))
Router.delete('/eliminarUsuario/:id', usuario.eliminarUsuario).use(authJwt.handle.bind(authJwt))
Router.post('/bulkRegister', usuario.bulkRegister).use(authJwt.handle.bind(authJwt))
Router.post('/registrarSGVA', usuario.registrarSGVA)

Router.post('/huella/registrar', usuario.registrarHuella).use(authJwt.handle.bind(authJwt))
Router.post('/huella/verificar', usuario.verificarHuella)
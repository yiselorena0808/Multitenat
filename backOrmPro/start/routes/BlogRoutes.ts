import Route from "@adonisjs/core/services/router"
import BlogController from "../../app/controller/PublicacionBlogController.js"
import AuthJwtMiddleware from "../../app/middleware/auth_jwt.js"

const blog = new BlogController()
const authJwt = new AuthJwtMiddleware()

Route.post('/blogs', blog.crear).use(authJwt.handle.bind(authJwt))

// Listar blogs por empresa
Route.get('/blogs/empresa/:id_empresa', blog.listarPorEmpresa).use(authJwt.handle.bind(authJwt))

// Actualizar blog por ID
Route.put('/blogs/:id', blog.actualizar).use(authJwt.handle.bind(authJwt))

// Eliminar blog por ID
Route.delete('/blogs/:id', blog.eliminar).use(authJwt.handle.bind(authJwt))

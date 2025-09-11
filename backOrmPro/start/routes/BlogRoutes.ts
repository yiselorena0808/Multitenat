import Route from "@adonisjs/core/services/router"
import BlogController from "../../app/controller/PublicacionBlogController.js"
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"

const blog = new BlogController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()

Route.post('/crearBlog', blog.crearBlog).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/listarBlog', blog.listarBlog).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
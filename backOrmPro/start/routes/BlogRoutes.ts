import Route from "@adonisjs/core/services/router"
import BlogController from "../../app/controller/PublicacionBlogController.js"
import AuthJwt from "../../app/middleware/auth_jwt.js"

const blog = new BlogController()
const authJwt = new AuthJwt()

Route.post('/crearBlog', blog.crearBlog).use(authJwt.handle.bind(authJwt))
Route.get('/listarBlog', blog.listarBlog).use(authJwt.handle.bind(authJwt))
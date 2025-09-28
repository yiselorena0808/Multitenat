import Route from "@adonisjs/core/services/router"
import DashboardController from "../../app/controller/DashboardController.js"
import AuthJwtMiddleware from "#middleware/auth_jwt"

const dash = new DashboardController()
const authJwt = new AuthJwtMiddleware()

Route.get('/dash',dash.funcionalidades).use(authJwt.handle.bind(authJwt))

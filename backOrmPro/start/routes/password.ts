import Route from "@adonisjs/core/services/router"
import PasswordController from "../../app/controller/PasswordController.js"

const passwordController = new PasswordController();

Route.post('/forgot-password', passwordController.forgotPassword)
Route.post('/reset-password', passwordController.resetPassword)

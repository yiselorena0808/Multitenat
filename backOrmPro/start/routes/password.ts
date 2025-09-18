import Route from "@adonisjs/core/services/router"

Route.post('/forgot-password', 'PasswordController.forgotPassword')
Route.post('/reset-password', 'PasswordController.resetPassword')

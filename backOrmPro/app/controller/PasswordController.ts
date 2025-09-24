import PasswordResetToken from '#models/password_reset_token'
import Usuario from '#models/usuario'
import { sendBrevoEmail } from '#services/BrevoService'
import { randomBytes } from 'crypto'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordController {
  async forgotPassword({ request, response }: HttpContext) {
    const { correo_electronico } = request.only(['correo_electronico'])
    const usuario = await Usuario.findBy('correo_electronico', correo_electronico)
    if (!usuario) {
      return response.notFound({ error: 'Usuario no encontrado' })
    }
    // Generar token seguro
    const token = randomBytes(32).toString('hex')
    await PasswordResetToken.create({
      user_id: usuario.id,
      token,
      created_at: DateTime.now(),
    })
    // Enviar correo con el enlace usando Brevo
    await sendBrevoEmail({
      to: usuario.correo_electronico,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: https://tusistema.com/reset-password?token=${token}`,
    })
    return response.ok({ message: 'Correo de recuperación enviado' })
  }

  async resetPassword({ request, response }: HttpContext) {
    const { token, nueva_contrasena } = request.only(['token', 'nueva_contrasena'])
    const resetToken = await PasswordResetToken.query().where('token', token).first()
    if (!resetToken) {
      return response.badRequest({ error: 'Token inválido' })
    }
    // Opcional: verificar expiración del token
    const usuario = await Usuario.find(resetToken.user_id)
    if (!usuario) {
      return response.notFound({ error: 'Usuario no encontrado' })
    }
  console.error('Contraseña antes:', usuario.contrasena)
  usuario.contrasena = nueva_contrasena
  await usuario.save()
  console.error('Contraseña después:', usuario.contrasena)
  await resetToken.delete()
  return response.ok({ message: 'Contraseña actualizada correctamente' })
  }
}

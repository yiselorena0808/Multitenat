import PasswordResetToken from '#models/password_reset_token'
import Usuario from '#models/usuario'
import { sendBrevoEmail } from '#services/BrevoService'
import hash from '@adonisjs/core/services/hash'
import { randomBytes } from 'crypto'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordController {
    public async forgotPassword({ request, response }: HttpContext) {
    const { correo_electronico } = request.only(['correo_electronico'])

    const usuario = await Usuario.findBy('correo_electronico', correo_electronico)

    // ✅ Para seguridad, no revelamos si el usuario existe o no.
    if (!usuario) {
      return response.ok({
        message: 'Si el correo existe, se ha enviado un correo con las instrucciones',
      })
    }

    // ✅ Opcional pero recomendable: borrar tokens anteriores de este usuario
    await PasswordResetToken.query().where('user_id', usuario.id).delete()

    // ✅ Token seguro en texto plano (SIN hash, como quieres ahora)
    const token = randomBytes(32).toString('hex')

    await PasswordResetToken.create({
      user_id: usuario.id,
      token,
      created_at: DateTime.now(),
      // Más adelante puedes añadir expires_at, etc.
    })

    // 🔍 Útil durante desarrollo/pruebas
    console.log('Token de recuperación de contraseña (SOLO DEV):', token)

    await sendBrevoEmail({
      to: usuario.correo_electronico,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: https://tusistema.com/reset-password?token=${token}`,
      // o manda solo el token si harás flujo por código
    })

    return response.ok({
      message: 'Si el correo existe, se ha enviado un correo con las instrucciones',
    })
  }

   public async resetPassword({ request, response }: HttpContext) {
    const { token, contrasena } = request.only(['token', 'contrasena'])

    // ✅ Buscar el token tal cual (SIN hash)
    const resetToken = await PasswordResetToken
      .query()
      .where('token', token)
      .first()

    if (!resetToken) {
      return response.badRequest({ error: 'Token inválido' })
    }

    // Aquí podrías validar expiración si más adelante añades una columna expires_at
    // if (resetToken.expires_at < DateTime.now()) { ... }

    const usuario = await Usuario.find(resetToken.user_id)

    if (!usuario) {
      // Si el usuario ya no existe, borra el token y devuelve error genérico
      await resetToken.delete()
      return response.badRequest({ error: 'Token inválido' })
    }

    // ✅ Validar nueva contraseña (mínimo ejemplo)
    if (!contrasena || contrasena.length < 8) {
      return response.badRequest({
        error: 'La contraseña debe tener mínimo 8 caracteres',
      })
    }

    // Cambiar contraseña
    usuario.contrasena = await hash.make(contrasena)
    await usuario.save()

    // Borrar el token para que no se pueda reutilizar
    await resetToken.delete()

    return response.ok({ message: 'Contraseña actualizada correctamente' })
  }
}

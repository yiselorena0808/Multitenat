import PasswordResetToken from '#models/password_reset_token'
import Usuario from '#models/usuario'
import { sendBrevoEmail } from '#services/BrevoService'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordController {
    public async forgotPassword({ request, response }: HttpContext) {
  const { correo_electronico } = request.only(['correo_electronico'])

  const usuario = await Usuario.findBy('correo_electronico', correo_electronico)

  if (!usuario) {
    return response.ok({
      message: 'Si el correo existe, se ha enviado un correo con las instrucciones',
    })
  }

  await PasswordResetToken.query().where('user_id', usuario.id).delete()

  // ✅ Código de 6 dígitos
  const token = String(Math.floor(100000 + Math.random() * 900000))

  await PasswordResetToken.create({
    user_id: usuario.id,
    token,
    created_at: DateTime.now(),
  })

  console.log('Código de recuperación (SOLO DEV):', token)

  await sendBrevoEmail({
    to: usuario.correo_electronico,
    subject: 'Recuperación de contraseña',
    text: `Tu código es ${token}. Escríbelo en la pantalla de recuperación y recuerda no compartirlo con nadie.`,
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

// Al menos una minúscula
if (!/[a-z]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos una letra minúscula',
  })
}

// Al menos una mayúscula
if (!/[A-Z]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos una letra mayúscula',
  })
}

// Al menos un número
if (!/[0-9]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos un número',
  })
}

// Al menos un carácter especial (cualquier cosa que no sea letra ni número)
if (!/[^A-Za-z0-9]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos un carácter especial',
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

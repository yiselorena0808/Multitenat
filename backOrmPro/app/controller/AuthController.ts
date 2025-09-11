import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuario'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {

  async login({ request, response }: HttpContext) {
  const { correo_electronico, contrasena } = request.only(['correo_electronico', 'contrasena'])

  try {
    // Buscar usuario por correo
    const usuario = await Usuario.findByOrFail('correo_electronico', correo_electronico)

    // Validar contraseña
    const passwordValid = await hash.verify(usuario.contrasena, contrasena)
    if (!passwordValid) {
      return response.unauthorized({ error: 'Credenciales inválidas' })
    }

  // Crear token usando el provider
  const token = await Usuario.accessTokens.create(usuario)

    // Respuesta exitosa
    return response.ok({
      message: 'Login exitoso',
      token: token, // 🔑 Aquí ya tienes el token
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo_electronico: usuario.correo_electronico,
        empresaId: usuario.id_empresa,
        areaId: usuario.id_area,
      },
    })
  } catch {
    return response.unauthorized({ error: 'Credenciales inválidas' })
  }
}



  async logout({ auth, response }: HttpContext) {
     // Eliminar el token actual usando el provider
    if (auth.user && auth.user.currentAccessToken) {
      await Usuario.accessTokens.delete(auth.user, auth.user.currentAccessToken.identifier)
    }

    return response.ok({ message: 'Sesión cerrada' })
  }


  async perfil({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'No autenticado' })
    }

    return response.ok({
      id: user.id,
      nombre: user.nombre,
      correo_electronico: user.correo_electronico,
      empresaId: user.id_empresa,
      areaId: user.id_area,
    })
  }
}

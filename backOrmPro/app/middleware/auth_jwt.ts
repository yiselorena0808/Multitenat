import type { HttpContext } from '@adonisjs/core/http'
import Jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'sstrict'

export default class AuthJwtMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const authHeader = request.header('Authorization')

    if (!authHeader) {
      return response.unauthorized({ error: 'Falta el token' })
    }

    try {
      const token = authHeader.replace('Bearer ', '').trim()
      const decoded = Jwt.verify(token, SECRET) as any

      const id = decoded.id
      const id_empresa = decoded.id_empresa ?? decoded.idEmpresa

      if (!id || !id_empresa) {
        return response.unauthorized({ error: 'Token inválido o incompleto' })
      }

      ;(request as any).user = {
        id,
        correoElectronico: decoded.correoElectronico,
        id_empresa,
        nombre: decoded.nombre,
      }

      await next()
    } catch (error) {
      return response.unauthorized({ error: 'Token inválido' })
    }
  }
}
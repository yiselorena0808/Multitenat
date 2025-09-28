import type { HttpContext } from '@adonisjs/core/http'
import Jwt from 'jsonwebtoken'



export default class AuthJwtMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const authHeader = request.header('Authorization')

    if (!authHeader) {
      return response.unauthorized({ error: 'Falta el token' })
    }

    console.log('Auth Header:', authHeader) // Depuración del encabezado

    try {
      const token = authHeader.replace('Bearer ', '').trim()
      const decoded = Jwt.verify(token, process.env.JWT_SECRET as string) as any
      console.log('Decoded Token:', decoded) // Depuración del token decodificado

      const id = decoded.id
      // id_empresa es opcional
      const id_empresa = decoded.id_empresa ?? decoded.idEmpresa

      if (!id) {
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
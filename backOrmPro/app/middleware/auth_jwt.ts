import Jwt from 'jsonwebtoken';
import type { HttpContext } from '@adonisjs/core/http'

const SECRET = process.env.jwt_secret || 'sstrict';

export default class AuthJwt {
  async handle({ request, response }: HttpContext, next: any) {
    const authheader = request.header('Authorization');

    if (!authheader) {
      return response.unauthorized({ message: 'Authorization header missing' });
    }

    const token = authheader.replace('Bearer', '').trim();

    if (!token) {
      return response.unauthorized({ message: 'Falta un token' });
    }

    try {
      const jwtDecoded = Jwt.verify(token, SECRET) as any;

      // Guardar datos del usuario en request
      request.usuarioLogueado = {
        id_usuario: jwtDecoded.id_usuario,
        nombre_usuario: jwtDecoded.nombre_usuario,
        id_empresa: jwtDecoded.id_empresa // si tu token incluye la empresa
      };

      await next();
    } catch (error) {
      return response.unauthorized({ message: 'Token inválido' });
    }
  }
}

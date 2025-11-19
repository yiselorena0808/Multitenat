import type { HttpContext } from '@adonisjs/core/http'
// Use process.env instead of Adonis Env to avoid missing module errors
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import Usuario from '#models/usuario'

export default class FaceAuthController {
  public async register({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('No autenticado')
    }

    const file = request.file('file', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png'],
    })

    if (!file || !file.tmpPath) {
      return response.badRequest('Falta la imagen')
    }

    const form = new FormData()
    form.append('user_id', user.id.toString())
    form.append('file', fs.createReadStream(file.tmpPath), file.clientName)

    try {
      const apiUrl = process.env.FACE_API_URL ?? 'http://127.0.0.1:8000' // ej: http://127.0.0.1:8000
      const { data } = await axios.post(`${apiUrl}/register`, form, {
        headers: form.getHeaders(),
      })

      return response.ok({
        message: 'Rostro registrado correctamente',
        data,
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError('Error registrando rostro')
    }
  }

  public async login({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png'],
    })

    if (!file || !file.tmpPath) {
      return response.badRequest('Falta la imagen')
    }

    const form = new FormData()
    form.append('file', fs.createReadStream(file.tmpPath), file.clientName)

    try {
      const apiUrl = process.env.FACE_API_URL ?? 'http://127.0.0.1:8000'
      const { data } = await axios.post(`${apiUrl}/verify`, form, {
        headers: form.getHeaders(),
      })

      if (!data.match) {
        return response.unauthorized('Rostro no reconocido')
      }

      // Buscar usuario por ID que devolvió el microservicio
      const user = await Usuario.find(data.user_id)
      if (!user) {
        return response.unauthorized('Usuario no encontrado')
      }

      const accessToken = await Usuario.accessTokens.create(user)

      const token = accessToken.value!.release()


      return {
        token,
        type: 'bearer',
        user,
      }
    } catch (error) {
      console.error(error)
      return response.internalServerError('Error en login con rostro')
    }
  }

}

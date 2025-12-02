import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import Usuario from '#models/usuario'

const SECRET = env.get('JWT_SECRET') as string
 // mismo secreto que usas al hacer login

const VALID_CONTEXTS = ['medical', 'construction', 'security_guard', 'welder'] as const
type ContextType = (typeof VALID_CONTEXTS)[number]

const CARGO_TO_CONTEXT: Record<string, ContextType> = {
  soldador: 'welder',
  soldadora: 'welder',
  médico: 'medical',
  medico: 'medical',
  doctor: 'medical',
  enfermero: 'medical',
  enfermera: 'medical',
  'guardia de seguridad': 'security_guard',
  seguridad: 'security_guard',
  ingeniero: 'construction',
  operario: 'construction',
  administracion: 'construction',
  usuario: 'construction',
}


export default class PpeChecksController {
  public async store({ request, response }: HttpContext) {
  const image = request.file('image')

  if (!image || !image.tmpPath) {
    return response.badRequest({ error: 'Imagen faltante' })
  }

  // 1) Leer header Authorization y sacar el token
  const authHeader = request.header('authorization')
  if (!authHeader) {
    return response.unauthorized({ error: 'Falta encabezado Authorization' })
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return response.unauthorized({ error: 'Formato de token inválido' })
  }

  // 2) Verificar el JWT
  let payload: any
  try {
    payload = jwt.verify(token, SECRET)
  } catch (err) {
    console.error('Error verificando JWT en /ppeCheck:', err)
    return response.unauthorized({ error: 'Token inválido o expirado' })
  }

  // 3) Buscar el usuario en la BD (por id del payload)
  const user = await Usuario.find(payload.id)
  if (!user) {
    return response.unauthorized({ error: 'Usuario no encontrado' })
  }

  // 4) Verificar que tenga cargo
  if (!user.cargo || user.cargo.trim() === '') {
    return response.badRequest({
      error: 'El usuario no tiene cargo asignado',
    })
  }

  const cargoNombre = user.cargo.trim().toLowerCase()
  let context: ContextType | undefined = CARGO_TO_CONTEXT[cargoNombre]

  // Fallback simple por si el cargo no está mapeado
  if (!context) {
    console.warn('Cargo sin mapeo a contexto EPP:', user.cargo)
    context = 'construction'
  }

  console.log('PPECheck -> usuario:', user.id, 'cargo:', user.cargo, 'contexto:', context)

  // 5) Resto del código igual: mandar imagen + contexto al microservicio
  const formData = new FormData()
  formData.append('file', fs.createReadStream(image.tmpPath), image.clientName)

  const microserviceUrl = 'http://host.docker.internal:8000/predict'
  const model = 'local'
  const urlWithParams = `${microserviceUrl}?model=${model}&context=${encodeURIComponent(
    context,
  )}`

  let data: any
  try {
    const res = await axios.post(urlWithParams, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    })
      data = res.data
      console.log('Microservicio respondió:', data)
  } catch (e: any) {
    console.error('Error llamando al microservicio:')
    console.error('  message:', e.message)
    console.error('  code   :', e.code)
    console.error('  status :', e.response?.status)
    console.error('  data   :', e.response?.data)

    return response.internalServerError({ error: 'Microservicio no disponible' })
  }

  // 6) Respuesta para Android
  return response.ok({
    ok: data.is_complete ?? (data.detections && data.detections.length > 0),
    detected: data.detected ?? data.detections?.map((d: any) => d.class) ?? [],
    missing: data.missing ?? [],
    detections: data.detections ?? [],
    model: data.model,
    context,
  })
}

}
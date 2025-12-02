// app/controllers/ppe_checks_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'


const VALID_CONTEXTS = ['medical', 'construction', 'security_guard', 'welder'] as const
type ContextType = (typeof VALID_CONTEXTS)[number]

// Mapa de nombre de cargo (en la BD) -> contexto del microservicio
const CARGO_TO_CONTEXT: Record<string, ContextType> = {
  'soldador': 'welder',
  'soldadora': 'welder',
  'médico': 'medical',
  'medico': 'medical',
  'doctor': 'medical',
  'enfermero': 'medical',
  'enfermera': 'medical',
  'guardia de seguridad': 'security_guard',
  'seguridad': 'security_guard',
  'ingeniero': 'construction',
  'operario': 'construction',
  'administracion': 'construction',
  'usuario': 'construction',
}

export default class PpeChecksController {
  public async store({ request, response, auth }: HttpContext) {
    const image = request.file('image')

    if (!image || !image.tmpPath) {
      return response.badRequest({ error: 'Imagen faltante' })
    }

    // 1) Usuario autenticado
    const user = await auth.authenticate()
    if (!user) {
      return response.unauthorized({ error: 'No autenticado' })
    }

    // Verificar que el usuario tenga un cargo asignado
    if (!user.cargo || user.cargo.trim() === '') {
      return response.badRequest({ 
        error: 'El usuario no tiene cargo asignado' 
      })
    }

    const cargoNombre = user.cargo.trim().toLowerCase()
    let context: ContextType | undefined = CARGO_TO_CONTEXT[cargoNombre]

    // Fallback simple por si algo no mapea
    if (!context) {
      console.warn('Cargo sin mapeo a contexto EPP:', user.cargo)
      context = 'construction' // contexto por defecto
    }

    // Resto del código sigue igual...
    const formData = new FormData()
    formData.append('file', fs.createReadStream(image.tmpPath), image.clientName)

    const microserviceUrl = 'http://host.docker.internal:8000/predict'
    const model = 'local'
    const urlWithParams = `${microserviceUrl}?model=${model}&context=${encodeURIComponent(context)}`
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

    // 🔥 NORMALIZAR RESPUESTA PARA ANDROID
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
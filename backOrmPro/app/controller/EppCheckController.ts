// app/controllers/ppe_checks_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

export default class PpeChecksController {
  public async store({ request, response }: HttpContext) {
    const image = request.file('image')

    if (!image || !image.tmpPath) {
      return response.badRequest({ error: 'Imagen faltante' })
    }

    const context = request.input('context') // "medical" | "industrial"

    if (!['industrial', 'medical'].includes(context)) {
      return response.badRequest({ error: 'Contexto inválido' })
    }

    // ---- Preparar imagen para enviar ----
    const formData = new FormData()
    formData.append('file', fs.createReadStream(image.tmpPath), image.clientName)

    let microserviceUrl = 'http://127.0.0.1:8000/predict'
    let model = ''

    if (context === 'industrial') {
      model = 'roboflow'
    }

    if (context === 'medical') {
      model = 'local'
    }

    const urlWithParams = `${microserviceUrl}?model=${model}`

    let data: any
    try {
      const res = await axios.post(urlWithParams, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      })
      data = res.data
      console.log('Microservicio respondió:', data)
    } catch (e) {
        console.error('Error llamando al microservicio:')
  console.error('  message:', e.message)
  console.error('  code   :', e.code)
  console.error('  status :', e.response?.status)
  console.error('  data   :', e.response?.data)

      return response.internalServerError({ error: 'Microservicio no disponible' })
    }

    // 🔥 NORMALIZAR RESPUESTA PARA ANDROID
    // FastAPI ahora devuelve:
    // { model, detections, detected, missing, is_complete }
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

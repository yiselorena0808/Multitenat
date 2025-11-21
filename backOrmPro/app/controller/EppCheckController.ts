// app/controllers/ppe_checks_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

export default class PpeChecksController {
  public async store({ request, response }: HttpContext) {
    const image = request.file('image', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png'],
    })

    if (!image) {
      return response.badRequest({ error: 'Falta el archivo image' })
    }

    // validar el archivo
    if (!image.isValid) {
      return response.badRequest({ errors: image.errors })
    }

    if (!image.tmpPath) {
      return response.internalServerError({
        error: 'No se pudo acceder al archivo temporal',
      })
    }

    // Enviar al microservicio Python usando el tmpPath
    const formData = new FormData()
    formData.append('image', fs.createReadStream(image.tmpPath), image.clientName)

    const pythonUrl = 'http://127.0.0.1:8000/predict'

    let detectionsResponse: any
    try {
      const { data } = await axios.post(pythonUrl, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      })
      detectionsResponse = data
    } catch (err) {
      console.error(err)
      return response.internalServerError({
        error: 'Error llamando al servicio de visión',
      })
    }

    const detections = (detectionsResponse?.detections || []) as Array<{
      class_name: string
      confidence: number
    }>

    // Ajusta estos nombres a los que salen en model.names
    const REQUIRED_EPP = ['Helmet', 'Gloves', 'Safety Vest', 'Glasses']

    const present = new Set(detections.map((d) => d.class_name))
    const missing = REQUIRED_EPP.filter((name) => !present.has(name))

    const ok = missing.length === 0

    return response.ok({
      ok,
      message: ok
        ? 'La persona lleva los EPP requeridos'
        : 'Faltan uno o más elementos de EPP',
      missing,
      // puedes quitar esto en producción si no lo necesitas
      rawDetections: detections,
    })
  }
}

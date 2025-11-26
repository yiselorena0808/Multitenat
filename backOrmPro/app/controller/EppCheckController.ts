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

    if (!["industrial", "medical"].includes(context)) {
      return response.badRequest({ error: "Contexto inválido" })
    }

    // ---- Preparar imagen para enviar ----
    const formData = new FormData()
    formData.append('file', fs.createReadStream(image.tmpPath), image.clientName)

    let microserviceUrl = ""
    let model = ""

    if (context === "industrial") {
      // 🌐 MODELO A - NUBE ROBOFLOW
      microserviceUrl = "http://127.0.0.1:8000/predict"
      model = "roboflow"
    }

    if (context === "medical") {
      // 🩺 MODELO B - YOLO LOCAL (best.pt)
      microserviceUrl = "http://127.0.0.1:8000/predict"
      model = "local"
    }

    // Agregar parámetro query
    const urlWithParams = `${microserviceUrl}?model=${model}`

    let data: any
    try {
      const res = await axios.post(urlWithParams, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      })
      data = res.data
    } catch (e) {
      console.error(e)
      return response.internalServerError({ error: "Microservicio no disponible" })
    }

    // 🔥 NORMALIZAR RESPUESTA PARA ANDROID
    // Tu API devuelve: { model: "...", detections: [...] }
    return response.ok({
      ok: (data.detections && data.detections.length > 0),
      detected: data.detections?.map((d: any) => d.class) ?? [],
      missing: [],
      detections: data.detections ?? [],  // Información completa de bboxes
      model: data.model,
      context
    })
  }
}
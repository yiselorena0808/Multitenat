// app/controllers/ppe_checks_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

//Con esto se definen clases genéricas de EPP

type EppType = 'helmet' | 'gloves' | 'glasses' | 'vest' | 'mask'

const YOLO_TO_EPP: Record<string, EppType> = {
  // cascos
  Helmet: 'helmet',
  HardHat: 'helmet',
  HeadHat: 'helmet',
  head_helmet: 'helmet',

  // guantes
  Gloves: 'gloves',
  hand_glove: 'gloves',
  handGlove: 'gloves',

  // gafas
  Glasses: 'glasses',
  goggles: 'glasses',
  eye_glasses: 'glasses',

  // chaleco
  'Safety Vest': 'vest',
  'Safety-Vest': 'vest',

  // mascarilla
  face_mask: 'mask',
  Mask: 'mask',
  mask: 'mask',
}

// Etiquetas bonitas para responder al cliente
const EPP_LABELS: Record<EppType, string> = {
  helmet: 'Casco',
  gloves: 'Guantes',
  glasses: 'Gafas de seguridad',
  vest: 'Chaleco reflectivo',
  mask: 'Mascarilla',
}


const REQUIRED_BY_CONTEXT: Record<string, EppType[]> = {
  construction: ['helmet', 'gloves', 'glasses', 'vest'],
  medical: ['mask', 'gloves', 'glasses'],
  welding: ['helmet', 'gloves', 'glasses'],
}



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

    //Analiza lo que manda Android
    const context = (request.input('context') || 'construction') as keyof typeof REQUIRED_BY_CONTEXT
    const requiredEpp = REQUIRED_BY_CONTEXT[context]

    if (!requiredEpp) {
      return response.badRequest({ error: `Contexto no soportado: ${context}` })
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

        const presentEpp = new Set<EppType>()
    for (const det of detections) {
      const epp = YOLO_TO_EPP[det.class_name]
      if (epp) {
        presentEpp.add(epp)
      }
    }

    // Ajusta estos nombres a los que salen en model.names
   const missingEppTypes = requiredEpp.filter((epp) => !presentEpp.has(epp))
    const ok = missingEppTypes.length === 0

    const missingLabels = missingEppTypes.map((epp) => EPP_LABELS[epp])

    return response.ok({
      ok,
      context,
      message: ok
        ? 'La persona lleva los EPP requeridos'
        : 'Faltan elementos de EPP',
      missing: missingLabels,   // <- aquí van los EPP faltantes, ya en español
      rawDetections: detections,
    })
  }
}

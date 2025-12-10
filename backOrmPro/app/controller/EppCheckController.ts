// app/controllers/ppe_checks_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import Usuario from '#models/usuario'
import { notificarSG_SST } from '#start/socket'
import NotificacionService from '#services/NotificacionesService' 

const SECRET = env.get('JWT_SECRET') as string

const notificacionService = new NotificacionService()

const VALID_CONTEXTS = ['medical', 'construction', 'security_guard', 'welder'] as const
type ContextType = (typeof VALID_CONTEXTS)[number]

type RegionConfig = {
  region: string
  x: number
  y: number
  width: number
  height: number
}

type MissingItem = {
  name: string
  region: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

// ====== MAPA DE CARGO -> CONTEXTO ======
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

// ====== REGIONES (normalizado por contexto) ======
const CONTEXT_REGIONS: Record<ContextType, Record<string, RegionConfig>> = {
  welder: {
    'welding mask': { region: 'head', x: 0.5, y: 0.15, width: 0.3, height: 0.2 },
    'welding gear': { region: 'torso', x: 0.35, y: 0.35, width: 0.3, height: 0.4 },
    gloves: { region: 'hands', x: 0.3, y: 0.7, width: 0.4, height: 0.15 },
    'safety mask': { region: 'face', x: 0.5, y: 0.2, width: 0.2, height: 0.15 },
  },
  medical: {
    'face mask': { region: 'face', x: 0.5, y: 0.2, width: 0.25, height: 0.15 },
    gloves: { region: 'hands', x: 0.3, y: 0.7, width: 0.4, height: 0.15 },
    gown: { region: 'body', x: 0.35, y: 0.35, width: 0.3, height: 0.4 },
    'face shield': { region: 'head', x: 0.5, y: 0.15, width: 0.25, height: 0.2 },
  },
  security_guard: {
    'security outfit': { region: 'torso', x: 0.35, y: 0.35, width: 0.3, height: 0.4 },
    'security guard': { region: 'torso', x: 0.35, y: 0.35, width: 0.3, height: 0.4 },
    belt: { region: 'waist', x: 0.35, y: 0.6, width: 0.3, height: 0.05 },
    boots: { region: 'feet', x: 0.4, y: 0.85, width: 0.2, height: 0.1 },
    cap: { region: 'head', x: 0.5, y: 0.15, width: 0.25, height: 0.2 },
    handcuffs: { region: 'hands', x: 0.3, y: 0.7, width: 0.2, height: 0.15 },
    'police baton': { region: 'hands', x: 0.6, y: 0.7, width: 0.2, height: 0.15 },
  },
  construction: {
    helmet: { region: 'head', x: 0.5, y: 0.15, width: 0.25, height: 0.2 },
    'safety vest': { region: 'torso', x: 0.35, y: 0.35, width: 0.3, height: 0.4 },
    'safety boots': { region: 'feet', x: 0.4, y: 0.85, width: 0.2, height: 0.1 },
    'protective glasses': { region: 'face', x: 0.5, y: 0.2, width: 0.2, height: 0.15 },
    'ear protection': { region: 'head', x: 0.5, y: 0.18, width: 0.25, height: 0.18 },
    gloves: { region: 'hands', x: 0.3, y: 0.7, width: 0.4, height: 0.15 },
  },
}

// ===== helpers =====
function buildMissingWithCoordinates(missing: string[], context: ContextType): MissingItem[] {
  const regions = CONTEXT_REGIONS[context] || {}
  return missing.map((item) => {
    const key = item.toLowerCase()
    const cfg =
      regions[key] ||
      (regions as any)[item] || {
        region: 'unknown',
        x: 0.5,
        y: 0.5,
        width: 0.1,
        height: 0.1,
      }

    return {
      name: item,
      region: cfg.region,
      coordinates: {
        x: cfg.x,
        y: cfg.y,
        width: cfg.width,
        height: cfg.height,
      },
    }
  })
}



// ===== controller =====
export default class PpeChecksController {
  public async store({ request, response }: HttpContext) {
    const image = request.file('image')

    if (!image || !image.tmpPath) {
      return response.badRequest({ error: 'Imagen faltante' })
    }

    // 1) JWT
    const authHeader = request.header('authorization')
    if (!authHeader) {
      return response.unauthorized({ error: 'Falta encabezado Authorization' })
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) {
      return response.unauthorized({ error: 'Formato de token inválido' })
    }

    let payload: any
    try {
      payload = jwt.verify(token, SECRET)
    } catch (err) {
      console.error('Error verificando JWT en /ppeCheck:', err)
      return response.unauthorized({ error: 'Token inválido o expirado' })
    }

    // 2) Usuario y contexto
    const user = await Usuario.find(payload.id)
    if (!user) {
      return response.unauthorized({ error: 'Usuario no encontrado' })
    }

    if (!user.cargo || user.cargo.trim() === '') {
      return response.badRequest({ error: 'El usuario no tiene cargo asignado' })
    }

    const cargoNombre = user.cargo.trim().toLowerCase()
    let context: ContextType | undefined = CARGO_TO_CONTEXT[cargoNombre]

    if (!context) {
      console.warn('Cargo sin mapeo a contexto EPP:', user.cargo)
      context = 'construction'
    }

    console.log(
      'PPECheck -> usuario:',
      user.id,
      'cargo:',
      user.cargo,
      'contexto:',
      context
    )

    // 3) Llamar al microservicio
    const formData = new FormData()
    formData.append('file', fs.createReadStream(image.tmpPath), image.clientName)

    const microserviceUrl = 'http://host.docker.internal:8000/predict'
    const model = 'local'
    const urlWithParams = `${microserviceUrl}?model=${model}&context=${encodeURIComponent(
      context
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

    // 4) coords (ya sin imagen anotada)
    const missingRaw: string[] = data.missing ?? []
const missingWithCoordinates = buildMissingWithCoordinates(missingRaw, context)

const ok =
  data.is_complete ??
  (data.detections && Array.isArray(data.detections) && data.detections.length > 0)

const responseBody = {
  ok,
  detected: data.detected ?? data.detections?.map((d: any) => d.class) ?? [],
  missing: missingWithCoordinates,
  missingRaw,
  detections: data.detections ?? [],
  model: data.model,
  context,
  annotatedImage: null, // por compatibilidad
  message: ok
    ? 'Todos los elementos de protección críticos están presentes'
    : `Faltan ${missingRaw.length} elementos de protección`,
}

// ⚠️ Si falta EPP, disparamos notificaciones tipo SGSST
if (!ok && missingRaw.length > 0) {
  // 1) Sacar empresa y nombre del usuario
  const id_empresa = (user as any).id_empresa // 🔧 ajusta al nombre real del campo
  const nombre_usuario =
    (user as any).nombre ||
    (user as any).nombre_completo ||
    (user as any).email ||
    `Usuario #${user.id}`

  const mensaje = `🦺 Falta EPP para ${nombre_usuario}: ${missingRaw.join(
    ', '
  )} (contexto: ${context})`

  // 2) Crear notificación en BD para el rol SGSST (igual que con los reportes)
  try {
    await notificacionService.crearParaSGSST(
      id_empresa,
      mensaje,
      null // aquí podrías pasar id_reporte o id_incidente si luego tienes uno
    )
  } catch (error) {
    console.warn('⚠ Error creando notificación de EPP en BD:', error)
  }

  // 3) Notificación en tiempo real por socket
  try {
    notificarSG_SST(id_empresa, mensaje, {
      tipo: 'ppe_alert',
      id_usuario: user.id,
      usuario: nombre_usuario,
      context,
      missingRaw,
      missing: missingWithCoordinates,
      // si quieres, también puedes enviar el raw de detecciones
      detecciones: data.detections ?? [],
      fecha: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('⚠ Error enviando notificación de EPP por socket:', error)
  }
}

    return response.ok(responseBody)
  }
}

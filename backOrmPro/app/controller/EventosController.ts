import type { HttpContext} from '@adonisjs/core/http'
import EventosService from '../services/EventosService.js'
import FcmHelper, { FcmData } from '../helpers/FcmHelper.js'
import { fcm } from '#start/firebase'



const service = new EventosService()

export default class EventosController {

  async listar({ response }: HttpContext) {
    const publicaciones = await service.listar()
    return response.json(publicaciones)
  }

  async listarPorEmpresa({ params, response }: HttpContext) {
    const publicaciones = await service.listarPorEmpresa(Number(params.id_empresa))
    return response.json(publicaciones)
  }

  async crear({ auth, request, response }: HttpContext) {
  // 1️ Verificar autenticación
  const user = auth?.user ?? (request as any).user
  if (!user) return response.unauthorized({ message: 'Usuario no autenticado' })

  // 2️ Campos enviados desde el frontend
  const data: any = request.only(['titulo', 'descripcion', 'fecha_actividad'])

  if (typeof data.fecha_actividad === 'string') {
    data.fecha_actividad = new Date(data.fecha_actividad)
  }

  // 3️ Archivos (imagen y archivo opcionales)
  const imagen = request.file('imagen')
  const archivo = request.file('archivo')
  const imagenPath = imagen?.tmpPath
  const archivoPath = archivo?.tmpPath

  try {
    // 4️ Crear publicación
    const publicacion = await service.createForUserTenant(user, data, archivoPath, imagenPath)

    // 5️ Enviar notificación a todos los usuarios suscritos al topic "eventos"
    await fcm.send({
      topic: 'eventos',
      notification: {
        title: 'Nuevo evento creado',
        body: `Se ha creado el evento: ${data.titulo}`,
      },
    })

    console.log('✅ Notificación enviada por nuevo evento:', data.titulo)

    // 6️ Responder al frontend
    return response.created({
      message: 'Evento creado y notificación enviada correctamente',
      data: publicacion,
    })
  } catch (error) {
    console.error('Error en crear el evento:', error)
    return response.status(500).json({
      message: error.message || 'Error interno al crear el evento',
    })
  }
}



  async actualizar({ params, request, response }: HttpContext) {
    const data = request.only(['titulo','fecha_actividad','descripcion'])
    const imagen = request.file('imagen')
    const archivo = request.file('archivo')

    const imagenPath = imagen ? imagen.tmpPath : undefined
    const archivoPath = archivo ? archivo.tmpPath : undefined

    const publicacion = await service.actualizar(Number(params.id), data, archivoPath, imagenPath)
    return response.json(publicacion)
  }

  async eliminar({ params, response }: HttpContext) {
    const result = await service.eliminar(Number(params.id))
    return response.json(result)
  }

 public async crearNoti({ auth, request, response }: HttpContext) {
  // 1️⃣ Usuario autenticado
  const user = auth?.user ?? (request as any).user
  if (!user) return response.unauthorized({ message: 'Usuario no autenticado' })

  // 2️⃣ Campos del body
  const { titulo, descripcion, fecha_actividad } = request.only([
    'titulo',
    'descripcion',
    'fecha_actividad',
  ])

  // 3️⃣ Completar con datos del usuario
  const data: any = {
    id_usuario: user.id,
    nombre_usuario: user.nombre_usuario ?? user.nombre ?? 'Usuario',
    titulo,
    descripcion,
    id_empresa: user.id_empresa,
    fecha_actividad:
      typeof fecha_actividad === 'string' ? new Date(fecha_actividad) : fecha_actividad,
  }

  // 4️⃣ Archivos (multipart/form-data)
  const imagen = request.file('imagen')
  const archivo = request.file('archivo')
  const imagenPath = imagen?.tmpPath
  const archivoPath = archivo?.tmpPath

  try {
    // 5️⃣ Crear evento
    const service = new EventosService()
    const publicacion = await service.crear(data, archivoPath, imagenPath)

    // 6️⃣ Topic por empresa o entorno
    const prefix = process.env.FCM_TOPIC_PREFIX || 'prod'
    const topic = `${prefix}_tenant_${publicacion.id_empresa}`

    // 7️⃣ Datos extra para FCM (siempre strings)
    const fcmData: FcmData = {
      tipo: 'evento', // 🔹 identifica qué abrir
      id: String(publicacion.id), // 🔹 ID del evento
      titulo: publicacion.titulo ?? '',
      idEmpresa: String(publicacion.id_empresa ?? ''),
      click_action: 'OPEN_EVENT_DETAIL', // 🔹 acción para Android
    }

    try {
      await FcmHelper.enviarNotificacion({
        titulo: `Nuevo evento: ${publicacion.titulo}`,
        cuerpo: descripcion ?? '',
        topic,
        data: fcmData,
      })
      console.log('✅ Notificación enviada con datos:', fcmData)
    } catch (pushErr) {
      console.error('⚠️ Error al enviar notificación FCM:', pushErr)
    }

    // 8️⃣ Respuesta
    return response.created({
      message: 'Evento creado y notificación enviada correctamente',
      data: publicacion,
    })
  } catch (error: any) {
    console.error('❌ Error al crear el evento:', error)
    return response.status(500).json({ message: error.message ?? 'Error interno' })
  }
 }
}

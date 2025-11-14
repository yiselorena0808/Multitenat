import type { HttpContext} from '@adonisjs/core/http'
import EventosService from '../services/EventosService.js'
import FcmHelper, { FcmData } from '../helpers/FcmHelper.js'

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
    // Obtener usuario del request (setiado por tu middleware)
    const user = auth?.user ?? (request as any).user
    if (!user) return response.unauthorized({ message: 'Usuario no autenticado' })

    // Campos enviados desde el frontend
    const data: any = request.only(['titulo', 'descripcion', 'fecha_actividad'])

    // Agregar automáticamente los campos obligatorios
    data.id_usuario = user.id
    data.nombre_usuario = user.nombre
    data.id_empresa = user.id_empresa

   if (typeof data.fecha_actividad === 'string') {
      data.fecha_actividad = new Date(data.fecha_actividad) // o DateTime.fromISO(...)
    }

    const imagen = request.file('imagen')
    const archivo = request.file('archivo')

    const imagenPath = imagen?.tmpPath
    const archivoPath = archivo?.tmpPath

    try {
      const publicacion = await service.crear(data, archivoPath, imagenPath)
      return response.json(publicacion)
    } catch (error) {
      console.error('Error en crear el evento:', error)
      return response.status(500).json({ message: error.message })
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
    // 1) Usuario autenticado
    const user = auth?.user ?? (request as any).user
    if (!user) return response.unauthorized({ message: 'Usuario no autenticado' })

    // 2) Campos del body
    const { titulo, descripcion, fecha_actividad } = request.only([
      'titulo',
      'descripcion',
      'fecha_actividad',
    ])

    // 3) Completar con datos del usuario (¡no confíes en el cliente!)
    const data: any = {
      id_usuario: user.id,
      nombre_usuario: user.nombre_usuario ?? user.nombre ?? 'Usuario',
      titulo,
      descripcion,
      id_empresa: user.id_empresa,
      fecha_actividad:
        typeof fecha_actividad === 'string' ? new Date(fecha_actividad) : fecha_actividad,
    }

    // 4) Archivos (multipart/form-data)
    const imagen = request.file('imagen')
    const archivo = request.file('archivo')
    const imagenPath = imagen?.tmpPath
    const archivoPath = archivo?.tmpPath

    try {
      // 5) Persistir usando tu servicio (Cloudinary incluido)
      const service = new EventosService()
      const publicacion = await service.crear(data, archivoPath, imagenPath)

      // 6) Enviar notificación al topic del tenant (multitenant)
      //    Topic = "<prefijo>_tenant_<id_empresa>", ej. "prod_tenant_42"
      const prefix = process.env.FCM_TOPIC_PREFIX || 'prod'
      const topic = `${prefix}_tenant_${publicacion.id_empresa}`

      // FCM 'data' debe ser string->string
      const fcmData: FcmData = {
        eventId: String(publicacion.id),
        tenantId: String(publicacion.id_empresa),
      }

      try {
        await FcmHelper.enviarNotificacion({
          titulo: `Nuevo evento: ${publicacion.titulo}`,
          cuerpo: descripcion ?? '',
          topic,
          data: fcmData,
        })
      } catch (pushErr) {
        // No tumbes la creación si FCM falla
        console.error('FCM push error:', pushErr)
      }

      // 7) Respuesta
      return response.created({ ok: true, data: publicacion })
    } catch (error: any) {
      console.error('Error en crear el evento:', error)
      return response.status(500).json({ message: error.message ?? 'Error interno' })
    }
  }

  async listarGeneral({ response }: HttpContext) {
    try {
    const publicaciones = await service.listarGeneral()
    return response.json(publicaciones)
    } catch (error) {
      console.error('Error al listar eventos:', error)
      return response.status(500).json({ message: 'Error interno' })
    }
  }
}

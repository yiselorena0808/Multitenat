import type { HttpContext} from '@adonisjs/core/http'
import EventosService from '../services/EventosService.js'

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

  async crearNoti({ auth, request, response }: HttpContext) {
 // Si usas middleware('auth'), toma de auth; si no, cae al request.user que tú seteas
    const user = auth?.user ?? (request as any).user
    if (!user) return response.unauthorized({ message: 'Usuario no autenticado' })

    // Campos del body
    const data: any = request.only(['titulo', 'descripcion', 'fecha_actividad'])

    // Completa con datos del usuario autenticado (no confíes en el cliente)
    data.id_usuario = user.id
    data.nombre_usuario = user.nombre_usuario ?? user.nombre ?? 'Usuario'
    data.id_empresa = user.id_empresa

    // Si tu columna es Date/DateTime, conviene parsear
    if (typeof data.fecha_actividad === 'string') {
      data.fecha_actividad = new Date(data.fecha_actividad) // o DateTime.fromISO(...)
    }

    // Archivos (multipart/form-data)
    const imagen = request.file('imagen')
    const archivo = request.file('archivo')

    const imagenPath = imagen?.tmpPath
    const archivoPath = archivo?.tmpPath

    try {
      const service = new EventosService()
      const publicacion = await service.crear(data, archivoPath, imagenPath)

      // Si tu método crear ya dispara la notificación, perfecto.
      // Si no, aquí podrías llamar a notifyTenantNewEvent(data.id_empresa, publicacion.id, publicacion.titulo)

      return response.created(publicacion) // 201
    } catch (error: any) {
      console.error('Error en crear el evento:', error)
      return response.status(500).json({ message: error.message ?? 'Error interno' })
    }
  }
}

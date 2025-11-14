import type { HttpContext } from '@adonisjs/core/http'
import ActividadLudicaService from '#services/ActividadLudicaService'
import cloudinary from '#config/cloudinary'

const actividadService = new ActividadLudicaService()

export default class ActividadLudicaController {
  // Crear actividad lúdica
  async crearActividad({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) {
        return response.unauthorized({ error: 'Usuario no autenticado' })
      }

      const datos = request.only(['nombre_actividad', 'fecha_actividad', 'descripcion']) as any
      datos.id_usuario = user.id
      datos.id_empresa = user.id_empresa
      datos.nombre_usuario = user.nombre

      // Archivos
      const imagenVideo = request.file('imagen_video', {
        size: '20mb',
        extnames: ['jpg', 'png', 'mp4', 'mov'],
      })
      const archivoAdjunto = request.file('archivo_adjunto', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      })

      // Subida a Cloudinary si existen
      if (imagenVideo && imagenVideo.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenVideo.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        })
        datos.imagen_video = upload.secure_url
      }

      if (archivoAdjunto && archivoAdjunto.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoAdjunto.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        })
        datos.archivo_adjunto = upload.secure_url
      }

      const actividad = await actividadService.crear(datos)

      return response.json({
        mensaje: 'Actividad creada correctamente',
        actividad,
      })
    } catch (error: any) {
      console.error('Error en crearActividad:', error)
      return response.internalServerError({ error: error.message })
    }
  }

  // Listar actividades por empresa
  async listar({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' })

      const actividades = await actividadService.listarPorEmpresa(user.id_empresa)
      return response.json(actividades)
    } catch (error: any) {
      return response.status(500).json({ error: error.message })
    }
  }

  // Actualizar actividad
  async actualizar({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' })

      const datos = request.all()
      const actividad = await actividadService.actualizar(Number(params.id), datos, user.id_empresa)
      return response.json(actividad)
    } catch (error: any) {
      return response.status(500).json({ error: error.message })
    }
  }

  // Eliminar actividad
  async eliminar({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' })

      const resultado = await actividadService.eliminar(Number(params.id), user.id_empresa)
      return response.json(resultado)
    } catch (error: any) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async listarMisActividades ({ request, response}: HttpContext) {
        const usuario = (request as any).user
        if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })
  
        const filtros = {
        q: request.input('q'),
        estado: request.input('estado'),
        fechaDesde: request.input('fechaDesde'),
        fechaHasta: request.input('fechaHasta'),
        page: Number(request.input('page') ?? 1),
        perPage: Math.min(Number(request.input('perPage') ?? 10), 100),
        orderBy: request.input('orderBy'),
        orderDir: request.input('orderDir')
      } as any
      
        const page = await actividadService.listarUsuario(usuario.id, usuario.id_empresa, filtros)
        return response.ok({
          meta: {
            page: page.currentPage,
            perPage: page.perPage,
            total: page.total,
            lastPage: page.lastPage,
          },
          data: page.all(),
        })
      }
  
  public async listarGeneral ({ response }: HttpContext) {
        try {
          const actividades = await actividadService.listaGeneral()
          return response.ok(actividades)
        } catch (error: any) {
          return response.status(500).json({ error: error.message })
        }
      }
}

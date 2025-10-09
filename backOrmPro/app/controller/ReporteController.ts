import type { HttpContext } from "@adonisjs/core/http"
import ReporteService, { DatosReporte } from "#services/ReporteService"
import cloudinary from "#config/cloudinary"

const reporteService = new ReporteService()

export default class ReportesController {
  // Crear reporte
  public async crearReporte({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })

     

      const datos: DatosReporte = {
        cargo: request.input("cargo"),
        cedula: request.input("cedula"),
        fecha: request.input("fecha"),
        lugar: request.input("lugar"),
        descripcion: request.input("descripcion"),
        id_usuario: usuario.id,
        id_empresa: usuario.id_empresa,
        nombre_usuario: usuario.nombre,
        estado: request.input ("estado")
      }

      // Archivos opcionales
      const imagenFile = request.file("imagen")
      const archivoFile = request.file("archivos")

      if (imagenFile && imagenFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenFile.tmpPath, { folder: "reportes", resource_type: "auto" })
        datos.imagen = upload.secure_url
      }

      if (archivoFile && archivoFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoFile.tmpPath, { folder: "reportes", resource_type: "auto" })
        datos.archivos = upload.secure_url
      }

      const reporte = await reporteService.crear(usuario.id_empresa, datos)
      return response.json(reporte)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: "Error interno", detalle: error.message })
    }
  }

  // Listar reportes
  public async listarReportes({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })

      const reportes = await reporteService.listar(usuario.id_empresa)
      return response.json({ datos: reportes })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: "Error al listar reportes" })
    }
  }

  // Obtener reporte por ID
  public async listarReporteId({ request, params, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })

      const reporte = await reporteService.listarId(params.id, usuario.id_empresa)
      return response.json({ datos: reporte })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: "Error al obtener reporte" })
    }
  }

  // Actualizar reporte
  public async actualizarReporte({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })

      const datos: Partial<DatosReporte> = request.only([
        "cargo",
        "cedula",
        "fecha",
        "lugar",
        "descripcion",
        "estado",
        "nombre_usuario"
      ])

      const imagenFile = request.file("imagen")
      const archivoFile = request.file("archivos")

      if (imagenFile && imagenFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenFile.tmpPath, { folder: "reportes", resource_type: "auto" })
        datos.imagen = upload.secure_url
      }

      if (archivoFile && archivoFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoFile.tmpPath, { folder: "reportes", resource_type: "auto" })
        datos.archivos = upload.secure_url
      }

      const reporteActualizado = await reporteService.actualizar(params.id, usuario.id_empresa, datos)
      return response.json({ mensaje: "Reporte actualizado", datos: reporteActualizado })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  // Eliminar reporte
  public async eliminarReporte({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })

      await reporteService.eliminar(params.id, usuario.id_empresa)
      return response.json({ mensaje: "Reporte eliminado" })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  public async listarMisReportes ({ request, response, auth}: HttpContext) {
    const user = auth.user
    if(!user) return response.status(401).json({error: 'Usuario no autenticado'})

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
    
      const page = await reporteService.listarUsuario(user.id, user.id_empresa, filtros)
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

    public async mostarMio({params, response, auth}: HttpContext) {
      const user = auth.user
      if(!user) return response.status(401).json({error: 'Usuario no autenticado'})
      
        const reporte = await reporteService.obtenerUsuario(Number(params.id), user.id, user.id_empresa)
        if(!reporte) return response.status(404).json({ error: 'Reporte no encontrado'})
          return response.ok(reporte)
    }
  }


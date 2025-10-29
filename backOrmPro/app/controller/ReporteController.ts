import type { HttpContext } from "@adonisjs/core/http"
import ReporteService, { DatosReporte } from "#services/ReporteService"
import cloudinary from "#config/cloudinary"
import axios from 'axios'
import env from '#start/env'

import Reporte from "#models/reporte"
import Fingerprint from "#models/fingerprint"

const stripDataUrl = (s: string) => s.replace(/^data:[^,]+,/, '')
const reporteService = new ReporteService()

export default class ReportesController {
  // Crear reporte
  public async crearReporte({ request, response }: HttpContext) {
    try {
      const usuarioAuth = (request as any).user
      if (!usuarioAuth) {
        return response.status(401).json({ error: "Usuario no autenticado" })
      }

      // ✅ IDs como números
      const id_usuario = Number(request.input("id_usuario")) || usuarioAuth.id
      const id_empresa = Number(request.input("id_empresa")) || usuarioAuth.id_empresa
      const nombre_usuario = request.input("nombre_usuario") || usuarioAuth.nombre

      // Datos del reporte
      const datos: DatosReporte = {
        cargo: request.input("cargo"),
        cedula: request.input("cedula"),
        fecha: request.input("fecha"),
        lugar: request.input("lugar"),
        descripcion: request.input("descripcion"),
        estado: request.input("estado") || "Pendiente",
        id_usuario,
        id_empresa,
        nombre_usuario,
      }

      console.log("📦 Datos recibidos:", datos)
      console.log("👤 Usuario autenticado:", usuarioAuth)

      // Archivos opcionales
      const imagenFile = request.file("imagen", {
        size: "5mb",
        extnames: ["jpg", "jpeg", "png"],
      })

      const archivoFile = request.file("archivos", {
        size: "10mb",
        extnames: ["pdf", "doc", "docx", "xls", "xlsx"],
      })

      if (imagenFile && !imagenFile.isValid) {
        return response.badRequest({ error: imagenFile.errors })
      }

      if (archivoFile && !archivoFile.isValid) {
        return response.badRequest({ error: archivoFile.errors })
      }

      // Subida a Cloudinary (manejo de errores)
      if (imagenFile?.tmpPath) {
        try {
          const upload = await cloudinary.uploader.upload(imagenFile.tmpPath, {
            folder: "reportes",
            resource_type: "image",
          })
          datos.imagen = upload.secure_url
        } catch (e) {
          console.warn("Error subiendo imagen:", e)
        }
      }

      if (archivoFile?.tmpPath) {
        try {
          const upload = await cloudinary.uploader.upload(archivoFile.tmpPath, {
            folder: "reportes",
            resource_type: "auto",
          })
          datos.archivos = upload.secure_url
        } catch (e) {
          console.warn("Error subiendo archivo:", e)
        }
      }

      // Guardar en DB
      const reporte = await reporteService.crear(id_empresa, datos)
      return response.json(reporte)

    } catch (error: any) {
      console.error("💥 Error en crearReporte:", error)
      return response.status(500).json({
        error: "Error interno del servidor",
        detalle: error.message,
    })
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

  public async listarMisReportes ({ request, response}: HttpContext) {
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
    
      const page = await reporteService.listarUsuario(usuario.id, usuario.id_empresa, filtros)
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

    public async mostarMio({params, response, request}: HttpContext) {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: "Usuario no autenticado" })
      
        const reporte = await reporteService.obtenerUsuario(Number(params.id), usuario.id, usuario.id_empresa)
        if(!reporte) return response.status(404).json({ error: 'Reporte no encontrado'})
          return response.ok(reporte)
    }

public async verificarReporteSGVA({ params, request, response }: HttpContext) {
  try {
    const sgva = (request as any).user
    if (!sgva) return response.status(401).json({ error: 'Usuario no autenticado' })

    const reporteId = Number(params.id)
    if (isNaN(reporteId)) return response.badRequest({ error: 'ID de reporte inválido' })

    

    // Obtener reporte
    const reporte = await Reporte.query()
      .where('id_reporte', reporteId)
      .andWhere('id_empresa', sgva.id_empresa)
      .first()

    if (!reporte) return response.status(404).json({ error: 'Reporte no encontrado' })
    console.log('📌 Reporte encontrado:', reporte.id_reporte)

     const { image } = request.only(['image']) // puede venir como dataURL o base64 puro
     if (!image) return response.badRequest({ error: 'Huella no enviada' })
      const imageB64 = stripDataUrl(image)

      // 2) Template SGVA desde BD (¡debe ser del MISMO motor!)
      const fingerprint = await Fingerprint
        .query()
        .where('id_usuario', sgva.id)
        .first()
      if (!fingerprint?.template) {
        return response.badRequest({ error: 'Huella del SGVA no registrada/corrupta' })
      }
      const sgvaTemplateB64 =
        Buffer.isBuffer(fingerprint.template)
          ? fingerprint.template.toString('base64')
          : String(fingerprint.template)

      // 3) Microservicio
      const baseURL = env.get('PYTHON_SERVICE_URL') // ej. http://localhost:8000
      const api = axios.create({ baseURL, timeout: 20000 })

      // 3a) Extraer template de la imagen
      const { data: ext } = await api.post('/templates/from-base64', {
        image_b64: imageB64,
      })
      const probeTemplateB64 = ext.template_b64 // NBIS .xyt en base64

      // 3b) Comparar template vs template (umbral calibrable)
      const form = new URLSearchParams()
      form.append('template_a_b64', probeTemplateB64)
      form.append('template_b_b64', sgvaTemplateB64)
      form.append('threshold', '60')

      const { data: cmp } = await api.post('/match/templates', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const { score, match, threshold } = cmp
      const estado = match ? 'Aceptado' : 'Denegado'

      // 4) Persistir y responder
      reporte.merge({ estado })
      await reporte.save()
      return response.ok({ estado, score, threshold })
    } catch (err: any) {
      console.error('💥 Error comparar huellas:', err.response?.data || err.message)
      return response.status(500).json({ error: 'Error comparando huella con microservicio' })
    }
}
  }
 

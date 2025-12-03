import type { HttpContext } from '@adonisjs/core/http'
import ReporteService, { DatosReporte } from '#services/ReporteService'
import NotificacionService from '#services/NotificacionesService' 
import cloudinary from '#config/cloudinary'
import axios from 'axios'
import env from '#start/env'
import ExcelJS from 'exceljs'
import Reporte from '#models/reporte'
import Fingerprint from '#models/fingerprint'
import { DateTime } from 'luxon'
import Usuario from '#models/usuario'
import Notificacion from '#models/notificacione'
import { notificarSG_SST } from '#start/socket'

const stripDataUrl = (s: string) => s.replace(/^data:[^,]+,/, '')
const reporteService = new ReporteService()
const notificacionService = new NotificacionService()

export default class ReportesController {
  // Crear reporte
  public async crearReporte({ request, response }: HttpContext) {
    try {
      const usuarioAuth = (request as any).user
      if (!usuarioAuth) {
        return response.status(401).json({ error: 'Usuario no autenticado' })
      }

      const id_usuario = Number(request.input('id_usuario')) || usuarioAuth.id
      const id_empresa = Number(request.input('id_empresa')) || usuarioAuth.id_empresa
      const nombre_usuario = request.input('nombre_usuario') || usuarioAuth.nombre

      const datos: DatosReporte = {
        cargo: request.input('cargo'),
        cedula: request.input('cedula'),
        fecha: request.input('fecha'),
        lugar: request.input('lugar'),
        descripcion: request.input('descripcion'),
        estado: request.input('estado') || 'Pendiente',
        id_usuario,
        id_empresa,
        nombre_usuario,
      }

      console.log('Datos recibidos:', datos)
      console.log('Usuario autenticado:', usuarioAuth)

      const imagenFile = request.file('imagen', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })

      const archivoFile = request.file('archivos', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      })

      if (imagenFile && !imagenFile.isValid) {
        return response.badRequest({ error: imagenFile.errors })
      }

      if (archivoFile && !archivoFile.isValid) {
        return response.badRequest({ error: archivoFile.errors })
      }

      if (imagenFile?.tmpPath) {
        try {
          const upload = await cloudinary.uploader.upload(imagenFile.tmpPath, {
            folder: 'reportes',
            resource_type: 'image',
          })
          datos.imagen = upload.secure_url
        } catch (e) {
          console.warn('Error subiendo imagen:', e)
        }
      }

      if (archivoFile?.tmpPath) {
        try {
          const upload = await cloudinary.uploader.upload(archivoFile.tmpPath, {
            folder: 'reportes',
            resource_type: 'auto',
          })
          datos.archivos = upload.secure_url
        } catch (e) {
          console.warn('Error subiendo archivo:', e)
        }
      }

      // Crear reporte
      const reporte = await reporteService.crear(id_empresa, datos)
      console.log('✅ Reporte creado con ID:', reporte.id_reporte)

      // Crear notificaciones en BD
      try {
        await notificacionService.crearParaSGSST(
          id_empresa,
          `📋 Nuevo reporte #${reporte.id_reporte} creado por ${nombre_usuario} en ${datos.lugar}`,
          reporte.id_reporte
        )
      } catch (error) {
        console.warn('⚠ Error creando notificaciones en BD:', error)
      }

      // Notificación en tiempo real por socket
      notificarSG_SST(
        id_empresa,
        `📋 Nuevo reporte #${reporte.id_reporte} creado por ${nombre_usuario}`,
        {
          id_reporte: reporte.id_reporte,
          usuario: nombre_usuario,
          lugar: datos.lugar,
          descripcion:
            (datos.descripcion?.substring(0, 100) || '') +
            (datos.descripcion && datos.descripcion.length > 100 ? '...' : ''),
          estado: datos.estado,
          fecha: new Date().toISOString(),
        }
      )

      console.log('✅ Reporte creado y notificaciones enviadas')
      return response.json(reporte)
    } catch (error: any) {
      console.error('Error en crearReporte:', error)
      return response.status(500).json({
        error: 'Error interno del servidor',
        detalle: error.message,
      })
    }
  }

  // ========= NOTIFICACIONES =========

  // Obtener notificaciones del usuario
  public async obtenerNotificaciones({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const { soloNoLeidas = 'true' } = request.qs()

      const notificaciones = await notificacionService.obtenerPorUsuario(
        usuario.id,
        soloNoLeidas === 'true'
      )

      const notificacionesFormateadas = notificaciones.map((notif) => ({
        id: notif.id,
        mensaje: notif.mensaje,
        leida: notif.leida,
        fecha: notif.fecha.toISO(),
        id_reporte: notif.id_reporte,
        reporte: notif.reporte
          ? {
              id_reporte: notif.reporte.id_reporte,
              lugar: notif.reporte.lugar,
              descripcion: notif.reporte.descripcion,
              estado: notif.reporte.estado,
              fecha: notif.reporte.fecha,
              nombre_usuario: notif.reporte.nombre_usuario,
            }
          : null,
      }))

      return response.json({
        total: notificaciones.length,
        notificaciones: notificacionesFormateadas,
      })
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error)
      return response.status(500).json({ error: 'Error al obtener notificaciones' })
    }
  }

  // Marcar una notificación como leída
  public async marcarNotificacionLeida({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const exito = await notificacionService.marcarComoLeida(Number(params.id), usuario.id)

      if (!exito) {
        return response.status(404).json({ error: 'Notificación no encontrada' })
      }

      return response.json({
        mensaje: 'Notificación marcada como leída',
        id: params.id,
      })
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
      return response.status(500).json({ error: 'Error al marcar notificación' })
    }
  }

  // Marcar todas como leídas
  public async marcarTodasLeidas({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      await notificacionService.marcarTodasComoLeidas(usuario.id)

      return response.json({
        mensaje: 'Todas las notificaciones marcadas como leídas',
      })
    } catch (error) {
      console.error('Error marcando notificaciones como leídas:', error)
      return response.status(500).json({ error: 'Error al marcar notificaciones' })
    }
  }

  // Eliminar una notificación
  public async eliminarNotificacion({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const notificacion = await Notificacion.query()
        .where('id', params.id)
        .andWhere('usuario_id', usuario.id)
        .first()

      if (!notificacion) {
        return response.status(404).json({ error: 'Notificación no encontrada' })
      }

      await notificacion.delete()

      return response.json({
        mensaje: 'Notificación eliminada',
      })
    } catch (error) {
      console.error('Error eliminando notificación:', error)
      return response.status(500).json({ error: 'Error al eliminar notificación' })
    }
  }

  // Contador de notificaciones no leídas
  public async obtenerContadorNotificaciones({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const notificacionesNoLeidas = await Notificacion.query()
        .where('usuario_id', usuario.id)
        .andWhere('leida', false)
        .count('* as total')
        .first()

      return response.json({
        total: notificacionesNoLeidas?.$extras.total || 0,
      })
    } catch (error) {
      console.error('Error obteniendo contador de notificaciones:', error)
      return response.status(500).json({ error: 'Error al obtener contador' })
    }
  }

  // ========= CRUD REPORTES =========

  // Listar reportes por empresa
  public async listarReportes({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const reportes = await reporteService.listar(usuario.id_empresa)
      return response.json({ datos: reportes })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al listar reportes' })
    }
  }

  // Obtener reporte por ID
  public async listarReporteId({ request, params, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const reporte = await reporteService.listarId(params.id, usuario.id_empresa)
      return response.json({ datos: reporte })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al obtener reporte' })
    }
  }

  // Actualizar reporte
  public async actualizarReporte({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      const datos: Partial<DatosReporte> = request.only([
        'cargo',
        'cedula',
        'fecha',
        'lugar',
        'descripcion',
        'estado',
        'nombre_usuario',
      ])

      const imagenFile = request.file('imagen')
      const archivoFile = request.file('archivos')

      if (imagenFile && imagenFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenFile.tmpPath, {
          folder: 'reportes',
          resource_type: 'auto',
        })
        datos.imagen = upload.secure_url
      }

      if (archivoFile && archivoFile.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoFile.tmpPath, {
          folder: 'reportes',
          resource_type: 'auto',
        })
        datos.archivos = upload.secure_url
      }

      const reporteActualizado = await reporteService.actualizar(
        params.id,
        usuario.id_empresa,
        datos
      )
      return response.json({ mensaje: 'Reporte actualizado', datos: reporteActualizado })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  // Eliminar reporte
  public async eliminarReporte({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

      await reporteService.eliminar(params.id, usuario.id_empresa)
      return response.json({ mensaje: 'Reporte eliminado' })
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  // Listar reportes del usuario autenticado (paginado + filtros)
  public async listarMisReportes({ request, response }: HttpContext) {
    const usuario = (request as any).user
    if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

    const filtros = {
      q: request.input('q'),
      estado: request.input('estado'),
      fechaDesde: request.input('fechaDesde'),
      fechaHasta: request.input('fechaHasta'),
      page: Number(request.input('page') ?? 1),
      perPage: Math.min(Number(request.input('perPage') ?? 10), 100),
      orderBy: request.input('orderBy'),
      orderDir: request.input('orderDir'),
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

  // Mostrar un reporte que pertenece al usuario
  public async mostarMio({ params, response, request }: HttpContext) {
    const usuario = (request as any).user
    if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })

    const reporte = await reporteService.obtenerUsuario(
      Number(params.id),
      usuario.id,
      usuario.id_empresa
    )
    if (!reporte) return response.status(404).json({ error: 'Reporte no encontrado' })
    return response.ok(reporte)
  }

  // ========= HUELLA / SGVA =========

  public async verificar({ params, response }: HttpContext) {
    try {
      const usuario = await Usuario.find(params.id_usuario)

      if (!usuario) {
        return response.status(404).json({ error: 'Usuario no encontrado' })
      }

      if (!usuario.huella_base64) {
        return response.status(400).json({ error: 'El usuario no tiene huella registrada' })
      }

      const res = await axios.post('http://localhost:8080/sgva/verificar', {
        huella: usuario.huella_base64,
      })

      if (!res.data?.match) {
        return response
          .status(400)
          .json({ error: 'No coincide la huella con el servicio SGVA' })
      }

      usuario.huella_estado = 'Verificada'
      await usuario.save()

      return response.json({
        ok: true,
        mensaje: 'Huella verificada',
      })
    } catch (error) {
      console.error('Error SGVA:', error)
      return response.status(500).json({ error: 'No se pudo obtener la huella SGVA' })
    }
  }

  public async verificarReporteSGVA({ params, request, response }: HttpContext) {
    try {
      const sgva = (request as any).user
      if (!sgva) return response.status(401).json({ error: 'Usuario no autenticado' })

      const reporteId = Number(params.id)
      if (isNaN(reporteId)) return response.badRequest({ error: 'ID de reporte inválido' })

      const reporte = await Reporte.query()
        .where('id_reporte', reporteId)
        .andWhere('id_empresa', sgva.id_empresa)
        .first()

      if (!reporte) return response.status(404).json({ error: 'Reporte no encontrado' })
      console.log('📌 Reporte encontrado:', reporte.id_reporte)

      const { image } = request.only(['image']) // dataURL o base64 puro
      if (!image) return response.badRequest({ error: 'Huella no enviada' })
      const imageB64 = stripDataUrl(image)

      const fingerprint = await Fingerprint.query().where('id_usuario', sgva.id).first()
      if (!fingerprint?.template) {
        return response.badRequest({ error: 'Huella del SGVA no registrada/corrupta' })
      }

      const sgvaTemplateB64 = Buffer.isBuffer(fingerprint.template)
        ? fingerprint.template.toString('base64')
        : String(fingerprint.template)

      const baseURL = env.get('PYTHON_SERVICE_URL')
      const api = axios.create({ baseURL, timeout: 20000 })

      const { data: ext } = await api.post('/templates/from-base64', {
        image_b64: imageB64,
      })
      const probeTemplateB64 = ext.template_b64

      const form = new URLSearchParams()
      form.append('template_a_b64', probeTemplateB64)
      form.append('template_b_b64', sgvaTemplateB64)
      form.append('threshold', '60')

      const { data: cmp } = await api.post('/match/templates', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const { score, match, threshold } = cmp
      const estado = match ? 'Aceptado' : 'Denegado'

      reporte.merge({ estado })
      await reporte.save()

      return response.ok({ estado, score, threshold })
    } catch (err: any) {
      console.error('💥 Error comparar huellas:', err.response?.data || err.message)
      return response.status(500).json({ error: 'Error comparando huella con microservicio' })
    }
  }

  // ========= LISTADO GENERAL / ESTADO / EXPORT =========

  public async listarGeneral({ response }: HttpContext) {
    try {
      const reportes = await reporteService.listarGeneral()
      return response.json({ datos: reportes })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Error al listar los reportes' })
    }
  }

  public async actualizarEstadoConHuella({ request, response }: HttpContext) {
    try {
      const { id_reporte, estado } = request.only(['id_reporte', 'estado'])

      if (!id_reporte || !estado) {
        return response.status(400).json({
          error: 'id_reporte y estado son requeridos',
        })
      }

      const result = await ReporteService.actualizarEstadoConHuella({
        id_reporte: Number(id_reporte),
        estado,
      })

      return response.status(result.status).json(result.body)
    } catch (error) {
      console.log(error)
      return response.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  public async exportarReportesExcel({ response }: HttpContext) {
    try {
      const checks = await Reporte.all()

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Reportes')

      worksheet.columns = [
        { header: 'ID', key: 'id_reporte', width: 10 },
        { header: 'Usuario', key: 'nombre_usuario', width: 30 },
        { header: 'Cargo', key: 'cargo', width: 20 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Lugar', key: 'lugar', width: 20 },
        { header: 'Descripción', key: 'descripcion', width: 50 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Imagen', key: 'imagen', width: 30 },
        { header: 'Archivos', key: 'archivos', width: 30 },
      ]

      checks.forEach((check) => {
        worksheet.addRow({
          id_reporte: check.id_reporte,
          nombre_usuario: check.nombre_usuario,
          cargo: check.cargo,
          cedula: check.cedula,
          fecha: check.fecha,
          lugar: check.lugar,
          descripcion: check.descripcion,
          estado: check.estado,
          imagen: check.imagen,
          archivos: check.archivos,
        })
      })

      const fileName = `reportes_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()

      response
        .header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Access-Control-Allow-Origin', 'http://localhost:5173')
        .header('Access-Control-Allow-Credentials', 'true')

      return response.send(buffer)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar los reportes' })
    }
  }
}

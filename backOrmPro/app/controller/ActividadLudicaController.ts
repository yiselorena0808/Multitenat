import type { HttpContext } from '@adonisjs/core/http'
import ActividadLudicaService from '#services/ActividadLudicaService'
import cloudinary from '#config/cloudinary'
import ExcelJs from 'exceljs'
import ActividadLudica from '#models/actividad_ludica'
import { DateTime } from 'luxon'

const actividadService = new ActividadLudicaService()

export default class ActividadLudicaController {
// Crear actividad lúdica
  async crearActividad({ request, response }: HttpContext) {
    try {
      const user = (request as any).user;
      if (!user) {
        return response.unauthorized({ error: 'Usuario no autenticado' });
      }

      const body = request.only([
        'nombre_actividad',
        'fecha_actividad',
        'descripcion',
        'id_usuario',
        'id_empresa',
        'nombre_usuario'
      ]) as any;

      const id_usuario = body.id_usuario ? Number(body.id_usuario) : user.id;
      const id_empresa = body.id_empresa !== undefined && body.id_empresa !== ""
        ? Number(body.id_empresa)
        : user.id_empresa;

      const nombre_usuario = body.nombre_usuario || user.nombre;

      const datos: any = {
        nombre_actividad: body.nombre_actividad,
        fecha_actividad: body.fecha_actividad,
        descripcion: body.descripcion,
        id_usuario,
        id_empresa,
        nombre_usuario
      };

      const imagenVideo = request.file('imagen_video', {
        size: '20mb',
        extnames: ['jpg', 'png', 'mp4', 'mov'],
      });

      const archivoAdjunto = request.file('archivo_adjunto', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      });

      if (imagenVideo?.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenVideo.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        });
        datos.imagen_video = upload.secure_url;
      }

      if (archivoAdjunto?.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoAdjunto.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        });
        datos.archivo_adjunto = upload.secure_url;
      }

      // Guardar en DB
      const actividad = await actividadService.crear(datos);

      return response.json({
        mensaje: 'Actividad creada correctamente',
        actividad,
      });

    } catch (error: any) {
      console.error('Error en crearActividad:', error);
      return response.internalServerError({ error: error.message });
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

   
   public async exportarActividadesExcel({ response }: HttpContext) {
    try {
      const check = await ActividadLudica.all()

      const workbook = new ExcelJs.Workbook()
      const worksheet = workbook.addWorksheet('Actividades Lúdicas')

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ID Usuario', key: 'id_usuario', width: 15 },
        { header: 'Nombre Actividad', key: 'nombre_actividad', width: 30 },
        { header: 'Fecha Actividad', key: 'fecha_actividad', width: 20 },
        { header: 'Descripción', key: 'descripcion', width: 40 },
        { header: 'Nombre Usuario', key: 'nombre_usuario', width: 25 },
        { header: 'Fecha de Creación', key: 'created_at', width: 20 },
      ]

      check.forEach((actividad) => {
        worksheet.addRow({
          id: actividad.id,
          id_usuario: actividad.id_usuario,
          nombre_actividad: actividad.nombre_actividad,
          fecha_actividad: actividad.fecha_actividad,
          descripcion: actividad.descripcion,
          nombre_usuario: actividad.nombre_usuario,
          created_at: actividad.createdAt.toISODate(),
        })
      })

      const fileName = `actividades_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()

      response
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Access-Control-Allow-Origin', 'http://localhost:5173')
        .header('Access-Control-Allow-Credentials', 'true')

      return response.send(buffer)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar actividades lúdicas' })
    }
  }}

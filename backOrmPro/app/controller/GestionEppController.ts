import GestionEppService from '#services/GestionEppService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'
import ExcelJS from 'exceljs'
import GestionEpp from '#models/gestion_epp'
import { DateTime } from 'luxon'

const gestionService = new GestionEppService()

class GestionController {
  async crearGestion({ request, response }: HttpContext) {
    const gestionSchema = schema.create({
      cedula: schema.string(),
      id_cargo: schema.number(),
      importancia: schema.string.optional(),
      estado: schema.string.optional(), // "activo", "inactivo"
      cantidad: schema.number.optional(),
      id_area: schema.number.optional(),
      id_empresa: schema.number.optional(), // ahora es opcional
      productos: schema.array().members(schema.number()), // array de ids
    });

    const data = await request.validate({ schema: gestionSchema });
    const usuario = (request as any).user;

    if (!usuario) {
      return response.unauthorized({ mensaje: "Usuario no autenticado" });
    }

    try {
      const { cedula, id_cargo, importancia, estado, cantidad, productos, id_area, id_empresa } = data;

      // Usar el id_empresa enviado desde frontend o el del usuario si no se envía
      const empresaId = id_empresa ?? usuario.id_empresa;

      // Crear la gestión usando el servicio, incluyendo nombre y apellido
      const gestion = await gestionService.crear(
        {
          nombre: usuario.nombre ?? "",
          apellido: usuario.apellido ?? "",
          cedula,
          importancia,
          estado: estado?.toLowerCase() === 'activo' ? true : false,
          cantidad,
          id_usuario: usuario.id,
          id_cargo,
          id_area: id_area ,
          id_empresa: empresaId,
        },
        productos
      );

      return response.created({
        mensaje: 'Gestión creada correctamente',
        datos: gestion,
      });
    } catch (error: any) {
      console.error('Error al crear gestión:', error);
      return response.badRequest({ mensaje: error.message });
    }
  }

  async listarGestiones({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })
      const empresaId = usuario.id_empresa
      const gestiones = await gestionService.listar(empresaId)
      return response.json({ msj: 'listado', datos: gestiones })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarGestionPorId({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).user 
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })
      const empresaId = usuario.id_empresa
      const gestion = await gestionService.listarId(Number(params.id), empresaId)
      if (!gestion) return response.status(404).json({ error: 'Gestión no encontrada' })
      return response.json({ msj: 'Gestión encontrada', datos: gestion })
    } catch (error) {
      return response.json({ error: error.message })
    }
  }

  async actualizarGestion({ params, request, response }: HttpContext) {
    const gestionSchema = schema.create({
      cedula: schema.string.optional(),
      importancia: schema.string.optional(),
      estado: schema.string.optional(),
      id_area: schema.number.optional(),
      productosIds: schema.array.optional().members(schema.object().members({
        idProducto: schema.number(),
        cantidad: schema.number()
      })),
      id_cargo: schema.number.optional(),
      cantidad: schema.number.optional(),
    })

    const data = await request.validate({ schema: gestionSchema })
    const usuario = (request as any).user

    try {
      const gestion = await gestionService.actualizar(
        Number(params.id),
        {
          cedula: data.cedula,
          importancia: data.importancia,
          estado: data.estado?.toLowerCase() === 'activo' ? true : false,
          cantidad: data.cantidad,
          id_area: data.id_area,
          id_cargo: data.id_cargo,
        },
        data.productosIds,
        usuario
      )

      return response.ok({
        mensaje: 'Gestión actualizada correctamente',
        datos: gestion,
      })
    } catch (err: any) {
      console.error('❌ Error actualizando gestión:', err)
      return response.badRequest({ mensaje: err.message })
    }
  }

  async eliminarGestion({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.status(401).json({ error: 'Usuario no autenticado' })
      const empresaId = usuario.id_empresa
      const resp = await gestionService.eliminar(params.id, empresaId)
      return response.json({ msj: resp })
    } catch (error: any) {
      return response.json({ error: error.message })
    }
  }

  public async listarMisGestiones ({ request, response}: HttpContext) {
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

    const page = await gestionService.listarUsuario(usuario.id, usuario.id_empresa, filtros)
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

  async listarGeneral({ response }: HttpContext) {
    const gestiones = await gestionService.listarGeneral()
    return response.json(gestiones)
  }

  public async exportarGestionesExcel({ response }: HttpContext) {
    try {
      const check = await GestionEpp.all()

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Gestiones EPP')

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Apellido', key: 'apellido', width: 20 },
        { header: 'Cédula', key: 'cedula', width: 20 },
        { header: 'Importancia', key: 'importancia', width: 30 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Fecha de Creación', key: 'created_at', width: 20 },
        { header: 'Cargo', key: 'cargo', width: 25},
      ]

      check.forEach((gestion) => {
        worksheet.addRow({
          id: gestion.id,
          nombre: gestion.nombre,
          apellido: gestion.apellido,
          cedula: gestion.cedula,
          importancia: gestion.importancia,
          estado: gestion.estado ? 'Activo' : 'Inactivo',
          cantidad: gestion.cantidad,
          created_at: gestion.createdAt.toISODate(),
          cargo: gestion.cargo 
        })
      })

      const fileName = `epp_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()

      response
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Access-Control-Allow-Origin', 'http://localhost:5173')
        .header('Access-Control-Allow-Credentials', 'true')

      return response.send(buffer)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar gestiones EPP' })
    }
  }
}

export default GestionController

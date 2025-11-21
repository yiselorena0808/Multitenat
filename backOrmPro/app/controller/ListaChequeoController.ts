import type { HttpContext } from '@adonisjs/core/http'
import ListaChequeoService from '#services/ListaChequeoService'
import ExcelJS from 'exceljs'
import { DateTime } from 'luxon'
import ListaChequeo from '#models/lista_chequeo'

const listaService = new ListaChequeoService()

export default class ListaChequeoController {
  public async crear({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.unauthorized({ error: 'Usuario no autenticado' })

      const datos = request.only([
        'fecha',
        'hora',
        'modelo',
        'marca',
        'soat',
        'tecnico',
        'kilometraje',
        'placa',
        'observaciones',
        'id_usuario',
        'usuario_nombre',
        'id_empresa'
      ])

      const lista = await listaService.crear(datos, usuario)

      return response.json({ message: 'Lista creada correctamente', datos: lista })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error creando la lista de chequeo' })
    }
  }

  public async listar({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.unauthorized({ error: 'Usuario no autenticado' })

      const listas = await listaService.listar(usuario.id_empresa)
      return response.json({ datos: listas })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error al listar las listas de chequeo' })
    }
  }

  public async listarPorId({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.unauthorized({ error: 'Usuario no autenticado' })

      const lista = await listaService.listarPorId(usuario.id_empresa, params.id)
      if (!lista) return response.notFound({ error: 'Lista no encontrada' })

      return response.json({ datos: lista })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error al obtener la lista de chequeo' })
    }
  }

  public async actualizar({ request, response, params }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.unauthorized({ error: 'Usuario no autenticado' })

      const datos = request.only([
        'fecha',
        'hora',
        'modelo',
        'marca',
        'soat',
        'placa',
        'observaciones',
        'tecnico',
        'kilometraje',
      ])

      const lista = await listaService.actualizar(usuario.id_empresa, params.id, datos)
      if (!lista) return response.notFound({ error: 'Lista no encontrada' })

      return response.json({ message: 'Lista actualizada correctamente', datos: lista })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error al actualizar la lista de chequeo' })
    }
  }

  public async eliminar({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) return response.unauthorized({ error: 'Usuario no autenticado' })

      const eliminado = await listaService.eliminar(usuario.id_empresa, params.id)
      if (!eliminado) return response.notFound({ error: 'Lista no encontrada' })

      return response.json({ message: 'Lista eliminada correctamente' })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error al eliminar la lista de chequeo' })
    }
  }

  public async listarMisListas ({ request, response}: HttpContext) {
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
      
        const page = await listaService.listarUsuario(usuario.id, usuario.id_empresa, filtros)
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
  
   public async listarGeneral({ response }: HttpContext) {
      try {
        const listas = await listaService.listarGeneral()
        return response.json({ datos: listas })
      } catch (error) {
        console.error(error)
        return response.internalServerError({ error: 'Error al listar las listas de chequeo' })
      }  
  }

  public async exportarListaChequeoExcel({ response }: HttpContext) {
    try {
      const checks = await ListaChequeo.all()

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Listas de Chequeo')

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Usuario ID', key: 'id_usuario', width: 15 },
        { header: 'Usuario', key: 'usuario_nombre', width: 25 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Modelo', key: 'modelo', width: 20 },
        { header: 'Marca', key: 'marca', width: 20 },
        { header: 'SOAT', key: 'soat', width: 15 },
        { header: 'Técnico', key: 'tecnico', width: 20 },
        { header: 'Kilometraje', key: 'kilometraje', width: 15 },
        { header: 'Placa', key: 'placa', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 40 },
      ]

      checks.forEach((row) => {
        worksheet.addRow({
          id: row.id,
          id_usuario: row.id_usuario,
          usuario_nombre: row.usuario_nombre,
          fecha: row.fecha,
          hora: row.hora,
          modelo: row.modelo,
          marca: row.marca,
          soat: row.soat,
          tecnico: row.tecnico,
          kilometraje: row.kilometraje,
          placa: row.placa,
          observaciones: row.observaciones,
        })
      })

      const fileName = `listas_chequeo_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()

      response
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Access-Control-Allow-Origin', 'http://localhost:5173')
        .header('Access-Control-Allow-Credentials', 'true')

      return response.send(buffer)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar las listas de chequeo' })
    }
  }

}
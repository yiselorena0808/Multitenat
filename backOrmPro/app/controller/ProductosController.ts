import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'
import ProductoService from '../services/ProductoService.js'
import ExcelJS from 'exceljs'
import Producto from '#models/producto'


export default class ProductosController {
  // Crear producto
  async store({ request, response }: HttpContext) {
    const productoSchema = schema.create({
      nombre: schema.string(),
      descripcion: schema.string.optional(),
      estado: schema.boolean.optional(),
    })

    const data = await request.validate({ schema: productoSchema })
    const service = new ProductoService()
    const producto = await service.crearProducto(data)

    return response.created({
      message: 'Producto creado con éxito',
      data: producto,
    })
  }

  // Listar productos
  async index({ response }: HttpContext) {
    const service = new ProductoService()
    const productos = await service.listarProductos()
    return response.ok(productos)
  }

  // Mostrar producto por ID
  async show({ params, response }: HttpContext) {
    const service = new ProductoService()
    const producto = await service.obtenerProducto(params.id)
    return response.ok(producto)
  }

  // Actualizar producto
  async update({ params, request, response }: HttpContext) {
    const data = request.only(['nombre', 'descripcion', 'estado'])
    const service = new ProductoService()
    const producto = await service.actualizarProducto(params.id, data)

    return response.ok({
      message: 'Producto actualizado con éxito',
      data: producto,
    })
  }

  // Eliminar producto
  async destroy({ params, response }: HttpContext) {
    const service = new ProductoService()
    const result = await service.eliminarProducto(params.id)
    return response.ok(result)
  }

   async listarPorCargo({ params, response }: HttpContext) {
    const cargoId = Number(params.id)
    const service = new ProductoService()

    if (Number.isNaN(cargoId)) {
      return response.badRequest({ message: 'El id del cargo debe ser numérico' })
    }

    const productos = await service.listarPorCargoId(cargoId)
    return response.ok(productos)
  }

  // GET /cargos/nombre/:nombre/productos
  async listarPorCargoNombre({ params, response }: HttpContext) {
    try {
      const service = new ProductoService()
      const productos = await service.listarPorCargoNombre(params.nombre)
      return response.ok(productos)
    } catch {
      return response.notFound({ message: 'Cargo no encontrado' })
    }
  }
  

  public async listarGeneral({ response }: HttpContext) {
    try {
      const service = new ProductoService()
      const productos = await service.listarGeneral()
      return response.json({ datos: productos })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Error al listar los productos' })
    }
  }

  public async exportarProductosExcel({ response }: HttpContext) {
    try {
      const checks = await Producto.all()

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Productos')

      worksheet.columns = [
        { header: 'ID', key: 'id_producto', width: 12 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Descripción', key: 'descripcion', width: 40 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Fecha Creación', key: 'created_at', width: 20 },
      ]

      checks.forEach((p) => {
        worksheet.addRow({
          id_producto: p.id_producto,
          nombre: p.nombre,
          descripcion: p.descripcion,
          estado: p.estado ? 'Activo' : 'Inactivo',
          created_at: p.createdAt?.toISODate?.() ?? '',
        })
      })

      const fileName = `productos_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '_')}.xlsx`
      response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)
      await workbook.xlsx.write(response.response)
      response.status(200)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar productos' })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'
import ProductoService from '../services/ProductoService.js'

console.log('🧩 ProductoService importado:', ProductoService)

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

  // Listar productos por ID de cargo
  async listarPorCargo({ params, response }: HttpContext) {
    const service = new ProductoService()
    const productos = await service.listarPorCargo(params.id)
    return response.ok(productos)
  }

  // Listar productos por nombre de cargo
  async listarPorCargoNombre({ params, response }: HttpContext) {
    const service = new ProductoService()
    try {
      const productos = await service.listarPorCargoNombre(params.nombre)
      return response.ok(productos)
    } catch (error) {
      return response.notFound({ message: error.message })
    }
  }
}

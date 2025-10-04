import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'
import ProductoService from '#services/ProductoService'

export default class ProductosController {

   private service: ProductoService
  
    constructor() {
      this.service = new ProductoService()
    }

   // Crear producto
  async store({ request, response }: HttpContext) {
    const productoSchema = schema.create({
      nombre: schema.string(),
      descripcion: schema.string.optional(),
      estado: schema.boolean.optional(),
    })

    const data = await request.validate({ schema: productoSchema })
    const producto = await this.service.crearProducto(data)

    return response.created({
      message: 'Producto creado con éxito',
      data: producto,
    })
  }

  // Listar productos (todos activos, o podrías extender con cargoId)
  async index({ response }: HttpContext) {
    const productos = await this.service.listarProductos()
    return response.ok(productos)
  }

  // Mostrar un producto por ID
  async show({ params, response }: HttpContext) {
    const producto = await this.service.obtenerProducto(params.id)
    return response.ok(producto)
  }

  // Actualizar un producto
  async update({ params, request, response }: HttpContext) {
    const data = request.only(['nombre', 'descripcion', 'estado'])
    const producto = await this.service.actualizarProducto(params.id, data)

    return response.ok({
      message: 'Producto actualizado con éxito',
      data: producto,
    })
  }

  // Eliminar producto
  async destroy({ params, response }: HttpContext) {
    const result = await this.service.eliminarProducto(params.id)
    return response.ok(result)
  }

  async listarPorCargo({ params, response }: HttpContext) {
  const productos = await this.service.listarPorCargo(params.id)
  return response.ok(productos)
}

async listarPorCargoNombre({ params, response }: HttpContext) {
  try {
    const productos = await this.service.listarPorCargoNombre(params.nombre)
    return response.ok(productos)
  } catch (error) {
    return response.notFound({ message: error.message })
  }
}

}

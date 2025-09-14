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
      cargo_asignado: schema.string.optional(),
      estado: schema.boolean.optional(),
    })

    const data = await request.validate({ schema: productoSchema })
    const producto = await this.service.crearProducto(data)

    return response.created({
      message: 'Producto creado con éxito',
      data: producto,
    })
  }

  // Listar productos (opcionalmente filtrados por cargo)
  async index({ auth, response }: HttpContext) {
    const usuario = auth.user!
    const productos = await this.service.listarProductos(String(usuario.id_empresa))
    return response.ok(productos)
  }

  // Mostrar un producto por ID
  async show({ params, response }: HttpContext) {
    const producto = await this.service.obtenerProducto(params.id)
    return response.ok(producto)
  }

  // Actualizar un producto
  async update({ params, request, response }: HttpContext) {
    const data = request.only(['nombre', 'descripcion', 'cargo_asignado', 'estado'])
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
}

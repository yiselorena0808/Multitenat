import CargoService from '../services/CargoService.js'
import type { HttpContext } from '@adonisjs/core/http'

const service = new CargoService()

export default class CargosController {
  async listar({ response }: HttpContext) {
    const cargos = await service.listar()
    return response.json(cargos)
  }

  async crear({ request, response }: HttpContext) {
    const data = request.only(['cargo'])
    const cargo = await service.crear(data)
    return response.created(cargo)
  }

  async actualizar({ params, request, response }: HttpContext) {
    const data = request.only(['cargo'])
    const cargo = await service.actualizar(params.id, data)
    return response.json(cargo)
  }

  async eliminar({ params, response }: HttpContext) {
    await service.eliminar(params.id_cargo)
    return response.json({ message: 'Cargo eliminado' })
  }

  async productosPorCargo({ params, response }: HttpContext) {
    const productos = await service.productosPorCargoId(params.id)
    return response.json(productos)
  }

  async productosPorCargoNombre({ params, response }: HttpContext) {
    const productos = await service.productosPorCargoNombre(params.nombre)
    return response.json(productos)
  }

   public async crearProductoYAsociar({ request, params, response }: HttpContext) {
    try {
      const data = request.only(['nombre', 'codigo'])
      const producto = await service.crearProductoYAsociar(params.id, data)
      return response.status(201).json(producto)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async asociarProductoExistente({ request, params, response }: HttpContext) {
    try {
      const { productoId } = request.only(['productoId'])
      const result = await service.asociarProductoExistente(params.id, productoId)
      return response.json(result)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async listarProductos({ params, response }: HttpContext) {
    try {
      const productos = await service.listarProductos(params.id)
      return response.json(productos)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async desvincularProducto({ request, params, response }: HttpContext) {
    try {
      const { productoId } = request.only(['productoId'])
      const result = await service.desvincularProductos(params.id, [productoId])
      return response.json(result)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async reemplazarProductos({ request, params, response }: HttpContext) {
    try {
      const { productosIds } = request.only(['productosIds'])
      const result = await service.reemplazarProductos(params.id, productosIds)
      return response.json(result)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }}

    public async vincularProductos({ request, params, response }: HttpContext) {
    try {
      const { productosIds } = request.only(['productosIds'])
      const result = await service.vincularProductos(params.id, productosIds)
      return response.json(result)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }}
}

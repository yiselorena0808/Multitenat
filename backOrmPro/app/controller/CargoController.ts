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
}

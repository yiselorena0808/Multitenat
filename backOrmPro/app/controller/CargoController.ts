import CargoService from '../services/CargoService.js'
import type { HttpContext } from '@adonisjs/core/http'

const service = new CargoService()

export default class CargosController {
  async listar({ response }: HttpContext) {
  const cargos = await service.listar()
  return response.json(cargos)
}

async crear({ request, response }: HttpContext) {
  const data = request.only(['cargo', 'id_empresa']) // 👈 quitamos id_gestion
  const cargo = await service.crear(data)
  return response.created(cargo)
}

async actualizar({ params, request, response }: HttpContext) {
  try {
    const data = request.only(['cargo'])
    const id_cargo = params.id_cargo
    const cargo = await service.actualizar(id_cargo, data)
    return response.ok(cargo)
  } catch (error) {
    console.error('Error al actualizar el cargo:', error)
    return response.status(500).json({ error: 'Error al actualizar el cargo' })
}
}


async eliminar({ params, response }: HttpContext) {
  await service.eliminar(params.id) // 👈 usamos params.id, no params.id_cargo
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
    const data = request.only(['nombre', 'descripcion']) // 👈 corregido
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
  }
}

public async vincularProductos({ request, params, response }: HttpContext) {
  try {
    const { productosIds } = request.only(['productosIds'])
    const result = await service.vincularProductos(params.id, productosIds)
    return response.json(result)
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}

public async listarGeneral({ response }: HttpContext) {
    try {
      const cargos = await service.listarGeneral()
      return response.json(cargos)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Error al listar los cargos' })
    }
  }

}

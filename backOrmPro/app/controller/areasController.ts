import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/areaService'
import { messages } from '@vinejs/vine/defaults'

const areaService = new AreaService()

export default class AreasController {
  async crearArea({ request, response }: HttpContext) {
    try{
    const data = request.only([
      'nombre_area',
      'codigo_area',
      'descripcion',
      'id_empresa',
      'estado',
      'esquema',
      'alias'
    ])
    const area = await areaService.crearArea(data)
    return response.json({ msj: 'Área creada', datos: area })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }

  }

  async listarAreas({ response }: HttpContext) {
    try {
    const areas = await areaService.listarAreas()
    return response.json(areas)
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarId({ params, response }: HttpContext) {
    try {
      const area = await areaService.listarId(params.id)
      if (!area) {
        return response.json({ msj: 'Área no encontrada' })
      }
      return response.json({ msj: 'Área encontrada', datos: area })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async actualizar({ params, request, response }: HttpContext) {
    try {
      const data = request.body()
      const area = await areaService.actualizar(params.id, data)
      if(!area) {
        return response.json({ msj: 'Área no encontrada o no autorizada' })
      }
      return response.json({ msj: 'Área actualizada', datos: area })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async eliminar({ params, response }: HttpContext) {
    try {
      const resp = await areaService.eliminar(params.id)
      return response.json({ msj: resp })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }
}

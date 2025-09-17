import type { HttpContext } from '@adonisjs/core/http'
import ListaChequeoService from '#services/ListaChequeoService'

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

      const lista = await listaService.listarId(usuario.id_empresa, params.id)
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
}

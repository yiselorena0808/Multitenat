import GestionService from '#services/GestionEppService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'

const gestionService = new GestionService()


class GestionController {
  getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  getAreaId(request: any, auth?: any) {
    return auth?.user?.id_area || request.areaId
  }

  async crearGestion({ request, response, auth }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const areaId = this.getAreaId(request, auth)
      const datos = request.only(['id_usuario', 'nombre', 'apellido', 'cedula', 'cargo', 'productos', 'cantidad', 'importancia', 'estado']) as any
      datos.id_empresa = empresaId
      datos.id_area = areaId
      const nueva = await gestionService.crear(datos, empresaId)
      return response.json({ msj: 'gestion creada', datos: nueva })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarGestiones({ response, request, auth }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const gestiones = await gestionService.listar(empresaId)
      return response.json({ msj: 'listado', datos: gestiones })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async actualizarEstado({ params, request, response, auth }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const datos = request.body()
      const actualizado = await gestionService.actualizar(params.id, datos, empresaId)
      return response.json({ msj: 'estado actualizado', datos: actualizado })
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async eliminarGestion({ params, response, request, auth }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const resp = await gestionService.eliminar(params.id, empresaId)
      return response.json({ msj: resp })
    } catch (error) {
      return response.json({ error: error.message })
    }
  }
}

export default GestionController
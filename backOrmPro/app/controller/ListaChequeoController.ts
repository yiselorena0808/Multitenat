import ListaChequeoService from '#services/ListaChequeoService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import auth from '@adonisjs/auth/services/main'



class ListaChequeoController {
private service = new ListaChequeoService()

 getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  async crearLista({ request, response }: HttpContext) {
    try {
      const datos = request.only(['id_usuario','usuario_nombre', 'fecha', 'hora', 'modelo', 'marca', 'soat', 'tecnico', 'kilometraje']) as any
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(await this.service.crear(empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarListas({ response, request }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      return response.json( await this.service.listar(empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarListasId({response, request, params}: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const id = params.id
      return response.json(await this.service.listarId(id, empresaId))
    } catch (error) {
      return response.json({error: error.message, messages})
    }
  }

  async actualizarLista({request,response,params}: HttpContext) {
    try {
      const id = params.id
      const datos = request.only(['id_usuario','usuario_nombre', 'fecha', 'hora', 'modelo', 'marca', 'soat', 'tecnico', 'kilometraje'])
      const empresaId = this.getEmpresaId(request, auth)
      return response.json( await this.service.actualizar(id, empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }
  async eliminarLista({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(this.service.eliminar(id, empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }
}

export default ListaChequeoController

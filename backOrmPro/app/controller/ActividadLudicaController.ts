import ActividadLudicaService from '#services/ActividadLudicaService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import auth from '@adonisjs/auth/services/main'


class ActividadesLudicasController {
 private service = new ActividadLudicaService()

 getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  async crearActividad({ request, response }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const datos = request.only(['nombre_usuario', 'nombre_actividad', 'fecha_actividad', 'imagen_video', 'archivo_adjunto', 'descripcion']) as any
      return response.json(await this.service.crear(empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarActividades({ response, request }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      return response.json( await this.service.listar(empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarIdActividad({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request,auth)
      return response.json( await this.service.listarId(id, empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async eliminarActividad({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(this.service.eliminar(id, empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }}

    async actualzarActividad({request,response,params}: HttpContext) {  
      try {
        const id = params.id
        const empresaId = this.getEmpresaId(request, auth)
        const datos = request.only(['nombre_usuario', 'nombre_actividad', 'fecha_actividad', 'imagen_video', 'archivo_adjunto', 'descripcion'])
       
        return response.json(this.service.actualizar(id, empresaId,datos))
      } catch (error) {
        return response.json({ error: error.message, messages })
      }
    }
}

export default ActividadesLudicasController
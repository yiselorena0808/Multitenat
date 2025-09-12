import BlogService from '#services/PublicacionBlogService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import auth from '@adonisjs/auth/services/main'

const blogService = new BlogService()



class BlogController {
   private service = new BlogService()

   getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  async crearBlog({ request, response }: HttpContext) {
    try {
      const datos = request.only(['nombre_usuario', 'titulo', 'fecha_actividad', 'descripcion', 'imagen', 'archivo'])as any
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(await blogService.crear(empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarBlog({ response, request }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      return response.json( await blogService.listar(empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarBlogId({response, request, params}: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(await this.service.listarId(id, empresaId))
    } catch (e) {
      return response.json({error: e.message, messages})
    }
  }

  async actualizarBlog ({ response, request, params}: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      const datos = request.only(['nombre_usuario', 'titulo', 'fecha_actividad', 'descripcion', 'imagen', 'archivo'])as any

      return response.json(await this.service.actualizar(id, empresaId, datos))
    } catch(error) {
      return response.json({error: error.message, messages})
    }
  }

  async eliminarBlog ({request, response, params}: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      const id = params.id
      return response.json(this.service.eliminar(id, empresaId))
    } catch (error) {
      return response.json({error: error.message, messages})
    }
  }


}

export default BlogController
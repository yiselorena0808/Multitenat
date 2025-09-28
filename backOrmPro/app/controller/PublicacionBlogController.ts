
import BlogService from '#services/PublicacionBlogService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import cloudinary from '#config/cloudinary';


const blogService = new BlogService()



class BlogController {
  private service = new BlogService()

  async crearBlog({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const datos = request.only(['nombre_usuario', 'titulo', 'fecha_actividad', 'descripcion', 'imagen', 'archivo']) as any;
      datos.id_usuario = usuario.id_usuario;
      datos.nombre_usuario = usuario.nombre_usuario;

      // Archivos
      const imagen = request.file('imagen', {
        size: '20mb',
        extnames: ['jpg', 'png', 'jpeg', 'gif'],
      })
      const archivo = request.file('archivo', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      })

      // Subida a Cloudinary si existen
      if (imagen && imagen.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagen.tmpPath, {
          folder: 'blog',
          resource_type: 'auto',
        })
        datos.imagen = upload.secure_url
      }

      if (archivo && archivo.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivo.tmpPath, {
          folder: 'blog',
          resource_type: 'auto',
        })
        datos.archivo = upload.secure_url
      }

      const empresaId = usuario.id_empresa;
      return response.json(await blogService.crear(empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarBlog({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).user;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      return response.json(await blogService.listar(empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarBlogId({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).user;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const id = params.id;
      const empresaId = usuario.id_empresa;
      return response.json(await this.service.listarId(id, empresaId));
    } catch (e) {
      return response.json({ error: e.message, messages });
    }
  }

  async actualizarBlog({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).user;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const id = params.id;
      const empresaId = usuario.id_empresa;
      const datos = request.only(['nombre_usuario', 'titulo', 'fecha_actividad', 'descripcion', 'imagen', 'archivo']) as any;
      return response.json(await this.service.actualizar(id, empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async eliminarBlog({ request, response, params }: HttpContext) {
    try {
      const usuario = (request as any).user;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      return response.json(this.service.eliminar(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }
}

export default BlogController
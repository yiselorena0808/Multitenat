import ActividadLudicaService from '#services/ActividadLudicaService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import cloudinary from '#config/cloudinary';


class ActividadesLudicasController {
  private service = new ActividadLudicaService();

 getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  async crearActividad({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }

      const datos = request.only([
        'nombre_actividad',
        'fecha_actividad',
        'descripcion',
      ]) as any;

      datos.id_usuario = usuario.id_usuario;
      datos.nombre_usuario = usuario.nombre_usuario;

      // Archivos
      const imagenVideo = request.file('imagen_video', {
        size: '20mb',
        extnames: ['jpg', 'png', 'mp4', 'mov'],
      })
      const archivoAdjunto = request.file('archivo_adjunto', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      })

      // Subida a Cloudinary si existen
      if (imagenVideo && imagenVideo.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagenVideo.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        })
        datos.imagen_video = upload.secure_url
      }

      if (archivoAdjunto && archivoAdjunto.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivoAdjunto.tmpPath, {
          folder: 'actividades',
          resource_type: 'auto',
        })
        datos.archivo_adjunto = upload.secure_url
      }

      const actividad = await this.service.crear(datos);
      return response.status(201).json({ mensaje: 'Actividad creada correctamente', actividad });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }


  async listarIdActividad({ response, request }: HttpContext) {
  try {
    const usuario = (request as any).usuarioLogueado;
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const actividad = await this.service.listarId( usuario.id_empresa); // ← Cambiado
    return response.json(actividad);
  } catch (error: any) {
    return response.status(500).json({ error: error.message, messages });
  }
}

async eliminarActividad({ params, response, request }: HttpContext) {
  try {
    const id = params.id;
    const usuario = (request as any).usuarioLogueado;
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const resultado = await this.service.eliminar(id, usuario.id_empresa); // ← Cambiado
    return response.json({ mensaje: 'Actividad eliminada', resultado });
  } catch (error: any) {
    return response.status(500).json({ error: error.message, messages });
  }
}

async actualizarActividad({ request, response, params }: HttpContext) {
  try {
    const id = params.id;
    const usuario = (request as any).usuarioLogueado;
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const datos = request.all()
    
    const actividad = await this.service.actualizar(id, datos, usuario.id_empresa); // ← Cambiado
    return response.json({ mensaje: 'Actividad actualizada', actividad });
  } catch (error: any) {
    return response.status(500).json({ error: error.message, messages });
  }
}
}

export default ActividadesLudicasController

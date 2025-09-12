import ActividadLudicaService from '#services/ActividadLudicaService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'



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
        'imagen_video',
        'archivo_adjunto'
      ]) as any;

      datos.id_usuario = usuario.id_usuario;
      datos.nombre_usuario = usuario.nombre_usuario;

      const actividad = await this.service.crear(usuario.id_empresa, datos);
      return response.status(201).json({ mensaje: 'Actividad creada correctamente', actividad });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }

  async listarIdActividad({ params, response, request }: HttpContext) {
  try {
    const id = params.id;
    const usuario = (request as any).usuarioLogueado;
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const actividad = await this.service.listarId(id, usuario.id_empresa); // ← Cambiado
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
    
    const datos = request.only([
      'nombre_usuario', 
      'nombre_actividad', 
      'fecha_actividad', 
      'imagen_video', 
      'archivo_adjunto', 
      'descripcion'
    ]);
    
    const actividad = await this.service.actualizar(id, usuario.id_empresa, datos); // ← Cambiado
    return response.json({ mensaje: 'Actividad actualizada', actividad });
  } catch (error: any) {
    return response.status(500).json({ error: error.message, messages });
  }
}
}

export default ActividadesLudicasController

import ActividadLudicaService from '#services/ActividadLudicaService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'


class ActividadesLudicasController {
 private service = new ActividadLudicaService()

  async crearActividad({ request, response }: HttpContext) {
  try {
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
    ]) as any;

    datos.id_usuario = usuario.id;
    datos.id_empresa = usuario.id_empresa;

    console.log('Datos antes de crear:', datos);
    console.log('empresaId:', usuario.id_empresa);

    const actividad = await this.service.crear(usuario.id_empresa, datos);
    console.log('Actividad creada:', actividad);

    return response.status(201).json({ mensaje: 'Actividad creada correctamente', actividad });
  } catch (error) {
    console.error('Error en crearActividad:', error);
    return response.status(500).json({ error: error.message });
  }
  async listarIdActividad({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = (request as any).empresaId
      return this.service.listarId(id, empresaId)
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async eliminarActividad({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = (request as any).empresaId
      return this.service.eliminar(id, empresaId)
    } catch (error) {
      return response.json({ error: error.message, messages })
    }}

    async actualzarActividad({request,response,params}: HttpContext) {  
      try {
        const id = params.id
        const empresaId = (request as any).empresaId
        const datos = request.only(['nombre_usuario', 'nombre_actividad', 'fecha_actividad', 'imagen_video', 'archivo_adjunto', 'descripcion'])
       
        return this.service.actualizar(id, empresaId,datos)
      } catch (error) {
        return response.json({ error: error.message, messages })
      }
    }
}

export default ActividadesLudicasController

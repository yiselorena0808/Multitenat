import GestionService from '#services/GestionEppService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'

const gestionService = new GestionService()


class GestionController {
  async crearGestion({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const areaId = usuario.id_area || (request as any).areaId;
      const datos = request.only(['id_usuario', 'nombre', 'apellido', 'cedula', 'cargo', 'productos', 'cantidad', 'importancia', 'estado']) as any;
      datos.id_usuario = usuario.id_usuario;
      datos.id_empresa = empresaId;
      datos.id_area = areaId;
      const nueva = await gestionService.crear(datos, empresaId);
      return response.json({ msj: 'gestion creada', datos: nueva });
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarGestiones({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const gestiones = await gestionService.listar(empresaId);
      return response.json({ msj: 'listado', datos: gestiones });
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async actualizarEstado({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const datos = request.body();
      const actualizado = await gestionService.actualizar(params.id, datos, empresaId);
      return response.json({ msj: 'estado actualizado', datos: actualizado });
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async eliminarGestion({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const resp = await gestionService.eliminar(params.id, empresaId);
      return response.json({ msj: resp });
    } catch (error) {
      return response.json({ error: error.message });
    }
  }
}

export default GestionController
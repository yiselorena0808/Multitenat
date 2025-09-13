import ListaChequeoService from '#services/ListaChequeoService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'



class ListaChequeoController {
  private service = new ListaChequeoService()

  async crearLista({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const datos = request.only(['id_usuario','usuario_nombre', 'fecha', 'hora', 'modelo', 'marca', 'soat', 'tecnico', 'kilometraje']) as any;
      datos.id_usuario = usuario.id_usuario;
      datos.usuario_nombre = usuario.nombre_usuario;
      const empresaId = usuario.id_empresa;
      return response.json(await this.service.crear(empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarListas({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      return response.json(await this.service.listar(empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarListasId({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      return response.json(await this.service.listarId(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async actualizarLista({ request, response, params }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      const datos = request.only(['id_usuario','usuario_nombre', 'fecha', 'hora', 'modelo', 'marca', 'soat', 'tecnico', 'kilometraje']);
      return response.json(await this.service.actualizar(id, empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async eliminarLista({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
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

export default ListaChequeoController

import CargoService from "#services/CargoService";
import { messages } from "@vinejs/vine/defaults";
import { HttpContext } from "@adonisjs/core/http";


const cargoservice = new CargoService();

export default class CargoController {


  async crearCargo({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const datos = request.only(['cargo']) as any;
      datos.id_usuario = usuario.id_usuario;
      datos.usuario_nombre = usuario.nombre_usuario;
      const empresaId = usuario.id_empresa;
      return response.json(await cargoservice.crear(empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarCargo({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      return response.json(await cargoservice.listar(empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarCargoId({ response, request, params }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      return response.json(await cargoservice.listarId(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async actualizarCargo({ request, response, params }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      const datos = request.only(['cargo']);
      return response.json(await cargoservice.actualizar(id, empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async eliminarCargo({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      const id = params.id;
      return response.json(await cargoservice.eliminar(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async asociarProductos({ params, request, response }: HttpContext) {
    try {
      const cargoId = params.id;
      const productosIds = request.input('productosIds')

      const cargo = await cargoservice.asociarProductosACargo(cargoId, productosIds);

      return response.json({
        mensaje: 'Productos asociados al cargo correctamente',
        datos: cargo,
      });
    } catch (error) {
      return response.status(400).send({ mensaje: error.message });
    }
  }
}
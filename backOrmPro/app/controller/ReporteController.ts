
import ReporteService from '#services/ReporteService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import cloudinary from '#config/cloudinary';


const reporteService = new ReporteService()

class ReportesController {
  async crearReporte({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const datos = request.only(['nombre_usuario', 'cargo', 'cedula', 'fecha', 'lugar', 'descripcion', 'imagen', 'archivos']) as any;
      datos.id_usuario = usuario.id_usuario;
      datos.nombre_usuario = usuario.nombre_usuario;

      // Archivos
      const imagen = request.file('imagen', {
        size: '20mb',
        extnames: ['jpg', 'png', 'jpeg', 'gif'],
      })
      const archivos = request.file('archivos', {
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      })

      // Subida a Cloudinary si existen
      if (imagen && imagen.tmpPath) {
        const upload = await cloudinary.uploader.upload(imagen.tmpPath, {
          folder: 'reportes',
          resource_type: 'auto',
        })
        datos.imagen = upload.secure_url
      }

      if (archivos && archivos.tmpPath) {
        const upload = await cloudinary.uploader.upload(archivos.tmpPath, {
          folder: 'reportes',
          resource_type: 'auto',
        })
        datos.archivos = upload.secure_url
      }

      const empresaId = usuario.id_empresa;
      return response.json(await reporteService.crear(empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarReportes({ response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const empresaId = usuario.id_empresa;
      return response.json(await reporteService.listar(empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async listarReporteId({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const id = params.id;
      const empresaId = usuario.id_empresa;
      return response.json(await reporteService.listarId(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async actualizarReporte({ params, request, response }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const id = params.id;
      const empresaId = usuario.id_empresa;
      const datos = request.only(['nombre_usuario', 'cargo', 'cedula', 'fecha', 'lugar', 'descripcion', 'imagen', 'archivos']);
      return response.json(await reporteService.actualizar(id, empresaId, datos));
    } catch (error) {
      return response.json({ error: error.message, messages });
    }
  }

  async eliminarReporte({ params, response, request }: HttpContext) {
    try {
      const usuario = (request as any).usuarioLogueado;
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' });
      }
      const id = params.id;
      const empresaId = usuario.id_empresa;
      return response.json(reporteService.eliminar(id, empresaId));
    } catch (error) {
      return response.json({ error: error.message });
    }
  }

  async conteoReportes({ response }: HttpContext) {
    try {
      const resultado = await reporteService.conteo();
      return response.json({ msj: 'conteo realizado', datos: resultado });
    } catch (error) {
      return response.json({ error: error.message });
    }
  }
}

export default ReportesController
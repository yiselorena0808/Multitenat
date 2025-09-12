import ReporteService from '#services/ReporteService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import auth from '@adonisjs/auth/services/main'

const reporteService = new ReporteService()

class ReportesController {

 getEmpresaId(request: any, auth?: any) {
    return auth?.user?.id_empresa || request.empresaId
  }

  async crearReporte({ request, response }: HttpContext) {
    try {
      const datos = request.only(['nombre_usuario', 'cargo', 'cedula', 'fecha', 'lugar', 'descripcion', 'imagen', 'archivos'])as any
      const empresaId = this.getEmpresaId(request, auth)
      return response.json( await reporteService.crear(empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarReportes({ response, request }: HttpContext) {
    try {
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(await reporteService.listar(empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async listarReporteId({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      return response.json (await reporteService.listarId(id, empresaId))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async actualizarReporte({ params, request, response }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      const datos = request.only(['nombre_usuario', 'cargo', 'cedula', 'fecha', 'lugar', 'descripcion', 'imagen', 'archivos'])
      return response.json( await reporteService.actualizar(id, empresaId, datos))
    } catch (error) {
      return response.json({ error: error.message, messages })
    }
  }

  async eliminarReporte({ params, response, request }: HttpContext) {
    try {
      const id = params.id
      const empresaId = this.getEmpresaId(request, auth)
      return response.json(reporteService.eliminar(id, empresaId))
    } catch (error) {
      return response.json({ error: error.message })
    }
  }

  async conteoReportes({ response }:  HttpContext) {
    try {
      const resultado = await reporteService.conteo()
      return response.json({ msj: 'conteo realizado', datos: resultado })
    } catch (error) {
      return response.json({ error: error.message })
    }
  }
}

export default ReportesController
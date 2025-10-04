import GestionEppService from '#services/GestionEppService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'


const gestionService = new GestionEppService()


class GestionController {
async crearGestion({ request, response }: HttpContext) {
  const usuario = (request as any).user
  const { cedula, importancia, estado, fecha_creacion, productosIds, idCargo } = request.body()

  try {
    const gestion = await gestionService.crear(
      { cedula, importancia, estado, fecha_creacion },
      usuario,
      productosIds,
      idCargo
    )

    return response.created({
      mensaje: 'Gestión creada correctamente',
      datos: gestion,
    })
  } catch (err: any) {
    return response.status(400).send({ mensaje: err.message })
  }
}

 async listarGestiones({ response, request }: HttpContext) {
  try {
    const usuario = (request as any).user
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' })
    }
    const empresaId = usuario.id_empresa
    const gestiones = await gestionService.listar(empresaId)
    return response.json({ msj: 'listado', datos: gestiones })
  } catch (error) {
    return response.json({ error: error.message, messages }) // 👈 quitamos "messages"
  }
}

async actualizarEstado({ params, request, response }: HttpContext) {
  try {
    const usuario = (request as any).user
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { datos, productosIds } = request.body()
    const actualizado = await gestionService.actualizar(
      params.id,
      datos,
      productosIds,
      usuario  // 👈 aquí va el usuario, no empresaId
    )

    return response.json({ msj: 'estado actualizado', datos: actualizado })
  } catch (error) {
    return response.json({ error: error.message })
  }
}

async eliminarGestion({ params, response, request }: HttpContext) {
  try {
    const usuario = (request as any).user
    if (!usuario) {
      return response.status(401).json({ error: 'Usuario no autenticado' })
    }
    const empresaId = usuario.id_empresa
    const resp = await gestionService.eliminar(params.id, empresaId)
    return response.json({ msj: resp })
  } catch (error) {
    return response.json({ error: error.message })
  }
}
}

export default GestionController
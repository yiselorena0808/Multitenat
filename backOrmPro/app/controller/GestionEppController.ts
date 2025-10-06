import GestionEppService from '#services/GestionEppService'
import { messages } from '@vinejs/vine/defaults'
import type { HttpContext} from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'



const gestionService = new GestionEppService()


class GestionController {
async crearGestion({ request, response, auth }: HttpContext) {
    const gestionSchema = schema.create({
      cedula: schema.string(),
      id_cargo: schema.number(), // o schema.number() si es un id
      importancia: schema.string.optional(),
      estado: schema.string.optional(), // "activo", "inactivo"
      cantidad: schema.number.optional(),
      productos: schema.array().members(schema.number()), // array de ids
    })

    const data = await request.validate({ schema: gestionSchema })
    const usuario = auth.user!

    try {
         const { cedula, id_cargo, importancia, estado, cantidad, productos } = data

    // 3️⃣ Crear la gestión usando el servicio
    const gestion = await gestionService.crear(
      {
        cedula,
        importancia,
        estado: estado === 'activo',
        cantidad,
      },
      usuario,
      productos,
      id_cargo // si es idCargo o nombre, lo manejas en el service
    )

     return response.created({
      mensaje: 'Gestión creada correctamente',
      datos: gestion,
    })
    } catch (error) {
      console.error('Error al crear gestión:', error)
      return response.badRequest({ mensaje: error.message })
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

 async actualizarGestion({ params, request, auth, response }: HttpContext) {
    const gestionSchema = schema.create({
      cedula: schema.string.optional(),
      importancia: schema.string.optional(),
      estado: schema.string.optional(),
      productosIds: schema.array.optional().members(schema.number()),
      idCargo: schema.number.optional(),
      cantidad: schema.number.optional(),
    })

    const data = await request.validate({ schema: gestionSchema })
    const usuario = auth.user!

    try {
      const gestion = await gestionService.actualizar(
        Number(params.id),
        {
          cedula: data.cedula,
          importancia: data.importancia,
          estado: data.estado === 'activo',
          cantidad: data.cantidad,
        },
        data.productosIds,
        usuario
      )

      return response.ok({
        mensaje: 'Gestión actualizada correctamente',
        datos: gestion,
      })
    } catch (err) {
      console.error('❌ Error actualizando gestión:', err)
      return response.badRequest({ mensaje: err.message })
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
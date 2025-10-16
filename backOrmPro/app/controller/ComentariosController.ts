import type { HttpContext } from '@adonisjs/core/http'
import ComentarioService from '#services/ComentarioService'

const comentarioService = new ComentarioService()

export default class ComentarioController {
  // 📋 Listar comentarios
  async listar({ params, response }: HttpContext) {
    const { tipoEntidad, idEntidad } = params
    const comentarios = await comentarioService.listar(tipoEntidad, idEntidad)
    return response.json({ data: comentarios })
  }

  // ✏ Crear comentario
  async crear({ params, request, response }: HttpContext) {
    const user = (request as any).user
    if (!user) return response.status(401).json({ error: 'Usuario no autenticado' })

    const { tipoEntidad, idEntidad } = params
    const { contenido } = request.only(['contenido'])

    if (!contenido) return response.status(400).json({ error: 'El comentario no puede estar vacío' })

    const nuevoComentario = await comentarioService.crear({
      contenido,
      tipoEntidad,
      idEntidad,
      idUsuario: user.id,
      nombreUsuario: user.nombre,
    })

    return response.status(201).json({ message: 'Comentario creado', data: nuevoComentario })
  }

  // 🛠 Editar comentario
  async editar({ params, request, response }: HttpContext) {
    const user = (request as any).user
    const { idComentario } = params
    const { contenido } = request.only(['contenido'])

    const comentario = await comentarioService.buscarPorId(idComentario)
    if (!comentario) return response.status(404).json({ error: 'Comentario no encontrado' })

    // Solo autor o admin puede editar
    if (comentario.idUsuario !== user.id && user.rol !== 'admin') {
      return response.status(403).json({ error: 'No tienes permisos para editar este comentario' })
    }

    comentario.contenido = contenido
    await comentario.save()

    return response.json({ message: 'Comentario actualizado', data: comentario })
  }

  // ❌ Eliminar comentario
  async eliminar({ params, request, response }: HttpContext) {
    const user = (request as any).user
    const { idComentario } = params

    const comentario = await comentarioService.buscarPorId(idComentario)
    if (!comentario) return response.status(404).json({ error: 'Comentario no encontrado' })

    if (comentario.idUsuario !== user.id && user.rol !== 'admin') {
      return response.status(403).json({ error: 'No tienes permisos para eliminar este comentario' })
    }

    await comentario.delete()
    return response.json({ message: 'Comentario eliminado' })
  }
}
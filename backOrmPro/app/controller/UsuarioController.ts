import UsuarioService from '#services/UsuarioService'
import type { HttpContext } from '@adonisjs/core/http'

const usuarioService = new UsuarioService()

export default class UsuarioController {

  async register({ request, response }: HttpContext) {
    const {
      id_empresa,
      id_area,
      nombre,
      apellido,
      nombre_usuario,
      correo_electronico,
      cargo,
      contrasena,
      confirmacion
    } = request.only([
      'id_empresa',
      'id_area',
      'nombre',
      'apellido',
      'nombre_usuario',
      'correo_electronico',
      'cargo',
      'contrasena',
      'confirmacion'
    ])

    const resultado = await usuarioService.register(
      id_empresa,
      id_area,
      nombre,
      apellido,
      nombre_usuario,
      correo_electronico,
      cargo,
      contrasena,
      confirmacion
    )

    return response.status(201).json(resultado)
  }

  async login({ request, response }: HttpContext) {
    const { correo_electronico, contrasena } = request.only([
      'correo_electronico',
      'contrasena'
    ])
    const resultado = await usuarioService.login(correo_electronico, contrasena)
    return response.json(resultado)
  }

  async listarUsuarioId({ params, request, response }: HttpContext) {
    try {
      const usuarioLogueado = (request as any).user
      const id = parseInt(params.id)
      const empresaId = usuarioLogueado.id_empresa

      if (isNaN(id) || isNaN(empresaId)) {
        return response.badRequest({ error: 'ID inválido' })
      }

      const usuario = await usuarioService.listarId(id, empresaId)

      if (!usuario) {
        return response.notFound({ error: 'Usuario no encontrado' })
      }

      return response.json({ datos: usuario })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async listarUsuariosPorEmpresa({ params, request, response }: HttpContext) {
    try {
      const usuarioLogueado = (request as any).user
      const empresaId = parseInt(params.id_empresa) || usuarioLogueado.id_empresa

      if (isNaN(empresaId)) {
        return response.badRequest({ error: 'ID de empresa inválido' })
      }

      const usuarios = await usuarioService.listarPorEmpresa(empresaId)
      return response.json({ datos: usuarios })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async usuarioLogueado({ response }: HttpContext) {
    try {
      const usuario = (response as any).usuario
      return response.json(usuario)
    } catch (error) {
      return response.json({ error: error.message })
    }
  }

  async actualizarUsuario({ params, request, response }: HttpContext) {
    try {
    const datos = request.all()
    const empresaId = (response as any).empresaId
    const usuario = await usuarioService.actualizar(params.id, datos, empresaId)
    return response.json(usuario)
    } catch (error) {
      return response.json({ error: error.message })
    }
  }

  async eliminarUsuario({ params, response }: HttpContext) {
    try {
    const empresaId = (response as any).empresaId
    const resultado = await usuarioService.eliminar(params.id, empresaId)
    return response.json(resultado)
    } catch (error) {
      return response.json({ error: error.message })
    }
  }

  async conteoUsuarios({ response }: HttpContext) {
    const conteo = await usuarioService.conteo()
    return response.json(conteo)
  }
}

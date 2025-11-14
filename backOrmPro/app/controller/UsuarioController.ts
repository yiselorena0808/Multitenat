import UsuarioService from '#services/UsuarioService'
import type { HttpContext } from '@adonisjs/core/http'
import Fingerprint from '#models/fingerprint'
import { normalizeHuellaDataUrl } from '../utils/huella_topic.js'

const usuarioService = new UsuarioService()

export default class UsuarioController {
  async register({ request, response }: HttpContext) {
    const data = request.only([
      'id_empresa',
      'id_area',
      'nombre',
      'apellido',
      'nombre_usuario',
      'correo_electronico',
      'cargo',
      'contrasena',
      'confirmacion',
    ])

    const resultado = await usuarioService.register(
      data.id_empresa,
      data.id_area,
      data.nombre,
      data.apellido,
      data.nombre_usuario,
      data.correo_electronico,
      data.cargo,
      data.contrasena,
      data.confirmacion
    )

    return response.status(201).json(resultado)
  }

  async login({ request, response }: HttpContext) {
    const { correo_electronico, contrasena } = request.only(['correo_electronico', 'contrasena'])
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
      if (!usuario) return response.notFound({ error: 'Usuario no encontrado' })

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

  async actualizarUsuario({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' })

      const datos = request.only(['id_area', 'nombre', 'apellido', 'nombre_usuario', 'correo_electronico', 'cargo'])
      const usuario = await usuarioService.actualizar(params.id, datos, user.id_empresa)

      return response.json({ mensaje: 'Usuario actualizado correctamente', datos: usuario })
    } catch (error) {
      console.error('Error en actualizarUsuario:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async eliminarUsuario({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' })

      const resultado = await usuarioService.eliminar(params.id, user.id_empresa)
      return response.json(resultado)
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async conteoUsuarios({ response }: HttpContext) {
    const conteo = await usuarioService.conteo()
    return response.json(conteo)
  }

  async bulkRegister({ request, response }: HttpContext) {
    try {
      const usuarios = request.input('users')
      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        return response.badRequest({ error: 'No se enviaron usuarios' })
      }

      const resultado = await usuarioService.bulkRegister(usuarios)
      return response.status(201).json(resultado)
    } catch (error) {
      console.error('Error bulkRegister:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  // 🔹 Registrar usuario SGVA con huella
  async registrarSGVA({ request, response }: HttpContext) {
    try {
      const { nombre, apellido, correo_electronico, cargo, contrasena, id_empresa, id_area, huella } =
        request.only(['nombre', 'apellido', 'correo_electronico', 'cargo', 'contrasena', 'id_empresa', 'id_area', 'huella'])

      if (!huella) return response.badRequest({ error: 'Debe enviar la huella del usuario' })

      const huellaNormalizada = normalizeHuellaDataUrl(huella)
      if (!huellaNormalizada) return response.badRequest({ error: 'Error al normalizar la huella' })

      const resultado = await usuarioService.register(
        id_empresa,
        id_area,
        nombre,
        apellido,
        correo_electronico,
        correo_electronico,
        cargo,
        contrasena,
        contrasena
      )

      const nuevoUsuario = resultado.user
      if (!nuevoUsuario) return response.status(500).json({ error: 'Error creando usuario SGVA' })

      const templateBase64 = huellaNormalizada.replace(/^data:.*;base64,/, '')
      await Fingerprint.create({ id_usuario: nuevoUsuario.id, template: templateBase64 })

      return response.status(201).json({ mensaje: 'Usuario SGVA creado correctamente', usuario: nuevoUsuario })
    } catch (error) {
      console.error('Error registrarSGVA:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async registrarHuella({ request, auth, response }: HttpContext) {
    const usuario = (auth as any).user
    const templateBase64 = request.input('template')

    if (!templateBase64) return response.badRequest({ error: 'No se recibió la huella' })
    if (!usuario || !usuario.id) return response.unauthorized({ error: 'Usuario no autenticado' })

    const guardada = await usuarioService.guardarHuella(usuario.id, templateBase64)
    return response.json({ mensaje: 'Huella guardada correctamente', huella: guardada })
  }

  async verificarHuella({ request, response }: HttpContext) {
    const templateBase64 = request.input('template')
    const usuario = await usuarioService.verificarHuella(templateBase64)

    if (!usuario) return response.json({ encontrado: false, mensaje: 'No coincide con ninguna huella' })

    return response.json({ encontrado: true, usuario })
  }

  public async listarGeneral() {
    try {
    return await usuarioService.listarGeneral()
    } catch (error) {
      console.error('Error en listarGeneral:', error)
      throw error
    }
  }
}

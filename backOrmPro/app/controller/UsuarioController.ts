import UsuarioService from '#services/UsuarioService'
import type { HttpContext } from '@adonisjs/core/http'
import Fingerprint from '#models/fingerprint'
import { normalizeHuellaDataUrl } from '../utils/huella_topic.js'

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
    const user = (request as any).user
    if (!user) {
      return response.unauthorized({ error: 'Usuario no autenticado' })
    }

    // Solo permitimos actualizar estos campos
    const datos = request.only([
      'id_area',
      'nombre',
      'apellido',
      'nombre_usuario',
      'correo_electronico',
      'cargo',
    ])

   console.log('params.id:', params.id)
   console.log('user.id_empresa:', user.id_empresa)

   console.log('BODY:', request.body())
console.log('DATOS ONLY:', datos)



    const usuario = await usuarioService.actualizar(params.id, datos, user.id_empresa)
    return response.json({ mensaje: 'Usuario actualizado correctamente', datos: usuario })
  } catch (error) {
    console.error("Error en actualizarUsuario:", error)
    return response.status(500).json({ error: error.message })
  }
}


  public async eliminarUsuario({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!user) {
        return response.unauthorized({ error: 'Usuario no autenticado' })
      }

      const resultado = await usuarioService.eliminar(params.id, user.id_empresa)
      return response.json(resultado)
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      return response.status(500).json({ error: error.message })
  }
}


  async conteoUsuarios({ response }: HttpContext) {
    const conteo = await usuarioService.conteo()
    return response.json(conteo)
  }

  async bulkRegister({ request, response }: HttpContext) {
    try {
      const usuarios = request.input('users') as Array<{
        id_empresa: string
        id_area: string
        nombre: string
        apellido: string
        nombre_usuario: string
        correo_electronico: string
        cargo: string
        contrasena: string
        confirmacion: string
      }>

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

    async registrarSGVA({ request, response }: HttpContext) {
    try {
      const { nombre, apellido, correo_electronico, cargo, contrasena, id_empresa, id_area, huella } = request.only([
        'nombre', 'apellido', 'correo_electronico', 'cargo', 'contrasena', 'id_empresa', 'id_area', 'huella'
      ])

      if (!huella) {
        return response.badRequest({ error: 'Debe enviar la huella del usuario' })
      }

      const huellaNormalizada = normalizeHuellaDataUrl(huella)
      if (!huellaNormalizada) {
        return response.badRequest({ error: 'Error al normalizar la huella' })
      }

      // Registrar usuario normal
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

      const templateBuffer = Buffer.from(
        huellaNormalizada.replace(/^data:.*;base64,/, ''),
        'base64'
      )


      // Guardar huella
      await Fingerprint.create({
        id_usuario: nuevoUsuario.id,
        template: templateBuffer.toString('base64'),
      })

      return response.status(201).json({ mensaje: 'Usuario SGVA creado correctamente', usuario: nuevoUsuario })

    } catch (error: any) {
      console.error('Error registrarSGVA:', error)
      return response.status(500).json({ error: error.message })
 }
 }
   
  public async registrarHuella({ request, auth }: HttpContext) {
    const usuario = auth.user
    const templateBase64 = request.input('template')

    if (!usuario) {
      return { error: 'Usuario no autenticado' }
    }

    if (!templateBase64) {
      return { error: 'No se recibió la huella' }
    }

    const guardada = await usuarioService.guardarHuella(usuario.id, templateBase64)

    return {
      mensaje: 'Huella guardada correctamente',
      huella: guardada
    }
  }

  public async verificarHuella({ request }: HttpContext) {
    const templateBase64 = request.input('template')

    const usuario = await usuarioService.verificarHuella(templateBase64)

    if (!usuario) {
      return { encontrado: false, mensaje: 'No coincide con ninguna huella' }
    }

    return {
      encontrado: true,
      usuario
    }
  }

}


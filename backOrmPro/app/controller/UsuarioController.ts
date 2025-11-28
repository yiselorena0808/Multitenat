import UsuarioService from '#services/UsuarioService'
import type { HttpContext } from '@adonisjs/core/http'
import ExcelJS from 'exceljs'
import Usuario from '#models/usuario'
import { DateTime } from 'luxon'
import Fingerprint from '#models/fingerprint'
import { normalizeHuellaDataUrl } from '../utils/huella_topic.js'
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'

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

        const { contrasena, confirmacion } = data

    // 1. ¿Coinciden?
    if (contrasena !== confirmacion) {
      return response.badRequest({
        error: 'La contraseña y la confirmación no coinciden',
      })
    }

    if (!contrasena || contrasena.length < 8) {
  return response.badRequest({
    error: 'La contraseña debe tener mínimo 8 caracteres',
  })
}

// Al menos una minúscula
if (!/[a-z]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos una letra minúscula',
  })
}

// Al menos una mayúscula
if (!/[A-Z]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos una letra mayúscula',
  })
}

// Al menos un número
if (!/[0-9]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos un número',
  })
}

// Al menos un carácter especial (cualquier cosa que no sea letra ni número)
if (!/[^A-Za-z0-9]/.test(contrasena)) {
  return response.badRequest({
    error: 'La contraseña debe contener al menos un carácter especial',
  })
}


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
      return response.json({ 
        mensaje: 'Usuario eliminado correctamente',
        datos: resultado,
      })
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      // Manejar específicamente el error de "no encontrado"
      if (error.message.includes('no encontrado') || error.message.includes('no autorizado')) {
        return response.status(404).json({ 
          mensaje: error.message 
        })
      }
      return response.status(500).json({ error: error.message })
    }
  }
  // En UsuarioController.ts - agregar este método
  async eliminarGeneral({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user;
      if (!user) return response.unauthorized({ error: 'Usuario no autenticado' });

      // Opcional: Verificar si es Super Admin
      // const esSuperAdmin = user.rol === 'superadmin';
      // if (!esSuperAdmin) return response.unauthorized({ error: 'No autorizado' });

      const resultado = await usuarioService.eliminarGeneral(params.id);
      
      return response.json({ 
        mensaje: 'Usuario eliminado correctamente',
        datos: resultado 
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.message.includes('no encontrado')) {
        return response.status(404).json({ 
          mensaje: error.message 
        });
      }
      
      return response.status(500).json({ error: error.message });
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

  public async exportarUsuariosExcel({ response }: HttpContext) {
    try {
      const checks = await Usuario.all()

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Usuarios')

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Apellido', key: 'apellido', width: 20 },
        { header: 'Nombre Usuario', key: 'nombre_usuario', width: 25 },
        { header: 'Correo', key: 'correo_electronico', width: 30 },
        { header: 'Cargo', key: 'cargo', width: 20 },
        { header: 'Empresa ID', key: 'id_empresa', width: 12 },
        { header: 'Area ID', key: 'id_area', width: 12 },
        { header: 'Fecha Creación', key: 'created_at', width: 20 },
      ]

      checks.forEach((u) => {
        worksheet.addRow({
          id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          nombre_usuario: u.nombre_usuario,
          correo_electronico: u.correo_electronico,
          cargo: u.cargo,
          id_empresa: u.id_empresa,
          id_area: u.id_area,
          created_at: u.createdAt?.toISODate?.() ?? '',
        })
      })

      const fileName = `usuarios_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()

      response
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Access-Control-Allow-Origin', 'http://localhost:5173')
        .header('Access-Control-Allow-Credentials', 'true')

      return response.send(buffer)
    } catch (error: any) {
      console.error(error)
      return response.status(500).json({ error: 'Error al exportar usuarios' })
    }
  }

    public async registroCara({ request, response }: HttpContext) {
    try {
        console.log('📥 Recibiendo solicitud de registro facial...');
        
        const userId = request.input('user_id');
        console.log('👤 User ID recibido:', userId);

        const file = request.file('file', {
            size: '5mb',
            extnames: ['jpg', 'jpeg', 'png'],
        });

        if (!file || !file.tmpPath) {
            console.log('❌ No se recibió archivo');
            return response.badRequest('Falta la imagen');
        }

        console.log('📁 Archivo recibido:', file.clientName, file.size);

        // Leer el archivo y convertirlo a base64
        const fileBuffer = fs.readFileSync(file.tmpPath);
        const base64Image = fileBuffer.toString('base64');
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

        const apiUrl = process.env.FACE_API_URL ?? 'http://127.0.0.1:8000';
        const faceRegisterUrl = `${apiUrl}/face/register`;
        console.log('🔗 Conectando con:', faceRegisterUrl);

        // ENVIAR COMO FORMDATA, NO COMO JSON
        const formData = new FormData();
        formData.append('id_usuario', userId.toString()); // Cambiar a id_usuario
        formData.append('image', imageDataUrl);           // Cambiar a image

        console.log('📤 Enviando como FormData...');

        const { data } = await axios.post(faceRegisterUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('✅ Respuesta del servicio Face ID:', data);

        return response.ok({
            message: 'Rostro registrado correctamente',
            data,
        });
    } catch (error) {
        console.error('❌ Error completo en register:', error);
        console.error('📊 Error response:', error.response?.data);
        return response.internalServerError('Error registrando rostro: ' + error.message);
    }
}

public async loginFacial({ request, response }: HttpContext) {
    try {
        const file = request.file('file', {
            size: '5mb',
            extnames: ['jpg', 'jpeg', 'png'],
        });

        if (!file || !file.tmpPath) {
            return response.badRequest('Falta la imagen');
        }

        const apiUrl = process.env.FACE_API_URL ?? 'http://127.0.0.1:8000';
        const faceLoginUrl = `${apiUrl}/face/login`;

        // ENVIAR EL ARCHIVO BINARIO DIRECTAMENTE (igual que en register)
        const formData = new FormData();
        formData.append('image', fs.createReadStream(file.tmpPath)); // Archivo binario

        const { data } = await axios.post(faceLoginUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('🔑 Respuesta del servicio facial:', data);

        if (!data.authenticated) {
            return response.unauthorized('Rostro no reconocido');
        }

        // Buscar usuario por ID que devolvió el microservicio
        const userId = data.id_usuario || data.user_id;
        console.log('👤 Buscando usuario ID:', userId);
        
        const user = await Usuario.find(userId);
        if (!user) {
            console.log('❌ Usuario no encontrado con ID:', userId);
            return response.unauthorized('Usuario no encontrado');
        }

        const accessToken = await Usuario.accessTokens.create(user);
        const token = accessToken.value!.release();

        return {
            token,
            type: 'bearer',
            user,
        };
    } catch (error) {
        console.error('❌ Error completo en login:', error);
        return response.internalServerError('Error en login con rostro');
    }
}
}

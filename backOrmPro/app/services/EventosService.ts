import { v2 as cloudinary } from 'cloudinary'
import Eventos from '../models/eventos.js'
import { notifyTenantNewEvent } from '../services/PushService.js'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

type CrearDTO = {
  id_usuario: number
  nombre_usuario: string
  titulo: string
  fecha_actividad: Date
  descripcion?: string
  id_empresa: number
}


export default class EventosService {
  // Listar todas las publicaciones
  async listar() {
    return await Eventos.query().preload('usuario').preload('empresa')
  }

  // Listar publicaciones por empresa
  async listarPorEmpresa(id_empresa: number) {
    return await Eventos.query()
      .where('id_empresa', id_empresa)
      .preload('usuario')
      .preload('empresa')
  }

  // Crear nueva publicación
  async crear(data: any, archivoPath?: string, imagenPath?: string) {
    const publicacion = new Eventos()
    publicacion.id_usuario = data.id_usuario
    publicacion.nombre_usuario = data.nombre_usuario
    publicacion.titulo = data.titulo
    publicacion.fecha_actividad = data.fecha_actividad
    publicacion.descripcion = data.descripcion
    publicacion.id_empresa = data.id_empresa

    if (imagenPath) {
      const imgResult = await cloudinary.uploader.upload(imagenPath, {
        folder: 'imagenes_publicaciones',
        resource_type: 'auto',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      })
      publicacion.imagen = imgResult.secure_url
    }

    if (archivoPath) {
      const fileResult = await cloudinary.uploader.upload(archivoPath, {
        folder: 'archivos_publicaciones',
        resource_type: 'auto',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      })
      publicacion.archivo = fileResult.secure_url
    }

    await publicacion.save()
    return publicacion
  }

  // Actualizar publicación
  async actualizar(id: number, data: any, archivoPath?: string, imagenPath?: string) {
    const publicacion = await Eventos.findOrFail(id)
    publicacion.titulo = data.titulo ?? publicacion.titulo
    publicacion.descripcion = data.descripcion ?? publicacion.descripcion
    publicacion.fecha_actividad = data.fecha_actividad ?? publicacion.fecha_actividad

    if (imagenPath) {
      const imgResult = await cloudinary.uploader.upload(imagenPath, {
        folder: 'imagenes_publicaciones',
        resource_type: 'auto',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      })
      publicacion.imagen = imgResult.secure_url
    }

    if (archivoPath) {
      const fileResult = await cloudinary.uploader.upload(archivoPath, {
        folder: 'archivos_publicaciones',
        resource_type: 'auto',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      })
      publicacion.archivo = fileResult.secure_url
    }

    await publicacion.save()
    return publicacion
  }

  // Eliminar publicación
  async eliminar(id: number) {
    const publicacion = await Eventos.findOrFail(id)
    await publicacion.delete()
    return { mensaje: 'Publicación eliminada' }
  }

public async createForUserTenant(
    user: { id: number; nombre?: string; nombre_usuario?: string; id_empresa: number },
    data: { titulo: string; fecha_actividad: Date; descripcion?: string },
    archivoPath?: string,
    imagenPath?: string
  ) {
    // ⚠️ No confíes en datos del cliente: sobreescribe id_usuario / id_empresa con auth.user
    const payload: CrearDTO = {
      id_usuario: user.id,
      nombre_usuario: user.nombre_usuario ?? user.nombre ?? 'Usuario',
      titulo: data.titulo,
      fecha_actividad: data.fecha_actividad,
      descripcion: data.descripcion,
      id_empresa: user.id_empresa,
    }

    const publicacion = await this.crear(payload, archivoPath, imagenPath)

    // Notifica al topic del tenant (empresa) – usa los campos REALES del modelo
    try {
      await notifyTenantNewEvent(publicacion.id_empresa, publicacion.id, publicacion.titulo)
    } catch (e) {
      // No rompas la creación si FCM falla; loguea y sigue
      console.error('FCM error:', e)
    }

    return publicacion
  }


  async listarGeneral() {
    return await Eventos.all()
  }
}

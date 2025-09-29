import { v2 as cloudinary } from 'cloudinary'
import PublicacionBlog from '#models/publicacion_blog'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default class PublicacionBlogService {
  // Listar todas las publicaciones
  async listar() {
    return await PublicacionBlog.query().preload('usuario').preload('empresa')
  }

  // Listar publicaciones por empresa
  async listarPorEmpresa(id_empresa: number) {
    return await PublicacionBlog.query()
      .where('id_empresa', id_empresa)
      .preload('usuario')
      .preload('empresa')
  }

  // Crear nueva publicación
  async crear(data: any, archivoPath?: string, imagenPath?: string) {
    const publicacion = new PublicacionBlog()
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
    const publicacion = await PublicacionBlog.findOrFail(id)
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
    const publicacion = await PublicacionBlog.findOrFail(id)
    await publicacion.delete()
    return { mensaje: 'Publicación eliminada' }
  }
}

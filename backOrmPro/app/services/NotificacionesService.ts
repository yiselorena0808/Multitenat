import Notificacion from '#models/notificacione'
import Usuario from '#models/usuario'

 class NotificacionService {
  public async crearParaSGSST(
    idEmpresa: number,
    mensaje: string,
    idReporte?: number | null
  ): Promise<void> {
    try {
      // Buscar usuarios SG-SST
      const usuariosSGSST = await Usuario.query()
        .where('id_empresa', idEmpresa)
        .andWhere('cargo', 'SG-SST')
        .select('id')

      console.log(`👥 Usuarios SG-SST encontrados: ${usuariosSGSST.length}`)

      // Crear notificación para cada usuario
      for (const usuario of usuariosSGSST) {
        await Notificacion.create({
          usuario_id: usuario.id,
          mensaje: mensaje,
          id_reporte: idReporte ?? null,
          leida: false
        })
      }

      console.log(`✅ Notificaciones creadas para ${usuariosSGSST.length} usuarios`)

    } catch (error) {
      console.error('❌ Error creando notificaciones:', error)
      throw error
    }
  }

  /**
   * Obtener notificaciones de un usuario
   */
  public async obtenerPorUsuario(
    usuarioId: number,
    soloNoLeidas: boolean = true
  ): Promise<Notificacion[]> {
    const query = Notificacion.query()
      .where('usuario_id', usuarioId)
      .preload('reporte') // Cargar el reporte relacionado
      .orderBy('fecha', 'desc')

    if (soloNoLeidas) {
      query.where('leida', false)
    }

    return await query.limit(50)
  }

  /**
   * Marcar notificación como leída
   */
  public async marcarComoLeida(
    notificacionId: number,
    usuarioId: number
  ): Promise<boolean> {
    const notificacion = await Notificacion.query()
      .where('id', notificacionId)
      .andWhere('usuario_id', usuarioId)
      .first()

    if (!notificacion) {
      return false
    }

    notificacion.leida = true
    await notificacion.save()
    return true
  }

  /**
   * Marcar todas como leídas
   */
  public async marcarTodasComoLeidas(usuarioId: number): Promise<void> {
    await Notificacion.query()
      .where('usuario_id', usuarioId)
      .andWhere('leida', false)
      .update({ leida: true })
  }
}

export default new NotificacionService()
import { HttpContext } from '@adonisjs/core/http'

// Modelos
import Reporte from '#models/reporte'
import Usuario from '#models/usuario'
import ActividadLudica from '#models/actividad_ludica'
import GestionEpp from '#models/gestion_epp'
import ListaChequeo from '#models/lista_chequeo'

export default class DashboardController {
  public async funcionalidades({ request, response }: HttpContext) {
    try {
      const usuario = (request as any).user
      if (!usuario) {
        return response.status(401).json({ error: 'Usuario no autenticado' })
      }

      // ===================== REPORTES =====================
      const totalReportes = await Reporte.query()
        .where('id_empresa', usuario.id_empresa)
        .count('* as total')
        .first()

      // ===================== USUARIOS =====================
      const totalUsuarios = await Usuario.query()
        .where('id_empresa', usuario.id_empresa)
        .count('* as total')
        .first()

      // ===================== ACTIVIDADES LÚDICAS =====================
      const totalActividades = await ActividadLudica.query()
        .where('id_empresa', usuario.id_empresa)
        .count('* as total')
        .first()

      // ===================== GESTIÓN EPP =====================
      const totalGestionEpp = await GestionEpp.query()
        .where('id_empresa', usuario.id_empresa)
        .count('* as total')
        .first()

      // ===================== LISTAS DE CHEQUEO =====================
      const totalListasChequeo = await ListaChequeo.query()
        .where('id_empresa', usuario.id_empresa)
        .count('* as total')
        .first()

      // ===================== RESPUESTA =====================
      return response.json({
        datos: [
          { nombre: 'Reportes', total: Number(totalReportes?.$extras.total || 0) },
          { nombre: 'Usuarios', total: Number(totalUsuarios?.$extras.total || 0) },
          { nombre: 'Actividades Lúdicas', total: Number(totalActividades?.$extras.total || 0) },
          { nombre: 'Gestión EPP', total: Number(totalGestionEpp?.$extras.total || 0) },
          { nombre: 'Listas de Chequeo', total: Number(totalListasChequeo?.$extras.total || 0) },
        ]
      })
    } catch (error) {
      console.error('Error dashboard:', error)
      return response.status(500).json({ error: 'Error al obtener datos del dashboard' })
    }
  }
}

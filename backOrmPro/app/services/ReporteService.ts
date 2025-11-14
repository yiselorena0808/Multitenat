import Reporte from "#models/reporte"
import axios from 'axios'
import Env from '#start/env'
import Fingerprint from "#models/fingerprint"

export interface DatosReporte {
  id_usuario: number
  id_empresa: number
  nombre_usuario: string
  cargo: string
  cedula: string
  fecha: string
  lugar: string
  descripcion: string
  imagen?: string
  archivos?: string
  estado?: string
}

type Filtros = {
  q?: string           // búsqueda texto (lugar/descripcion)
  estado?: string
  fechaDesde?: string  // YYYY-MM-DD
  fechaHasta?: string  // YYYY-MM-DD
  page?: number
  perPage?: number
  orderBy?: 'fecha' | 'created_at'
  orderDir?: 'asc' | 'desc'
}

export default class ReporteService {
  // Crear reporte
  async crear(idEmpresa: number, datos: DatosReporte) {
    const reporte = new Reporte()
    reporte.fill({
      ...datos,
      id_empresa: idEmpresa,
      estado: datos.estado,
    })
    await reporte.save()
    return reporte
  }

  // Listar reportes por empresa
  async listar(idEmpresa: number) {
    return Reporte.query()
      .where("id_empresa", idEmpresa)
      .orderBy("fecha", "desc")
  }

  // Listar reporte por ID y empresa
  async listarId(id: number, idEmpresa: number) {
    return Reporte.query()
      .where("id_reporte", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()
  }

  // Actualizar reporte
  async actualizar(id: number, idEmpresa: number, datos: Partial<DatosReporte>) {
    const reporte = await Reporte.query()
      .where("id_reporte", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()

    reporte.merge(datos)
    await reporte.save()
    return reporte
  }

  // Eliminar reporte
  async eliminar(id: number, idEmpresa: number) {
    const reporte = await Reporte.query()
      .where("id_reporte", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()

    await reporte.delete()
    return { mensaje: "Reporte eliminado" }
  }

  // Conteo total de reportes
  async conteo() {
    const result = await Reporte.query().count("* as total")
    return result[0]
  }

  async listarUsuario (id_usuario: number, id_empresa: number, filtros: Filtros = {}) {
      const {
        q, 
        estado, 
        fechaDesde, 
        fechaHasta, 
        page = 1,
        perPage = 10,
        orderBy = 'created_at',
        orderDir = 'desc'
      } = filtros

      const query = Reporte.query().apply((scopes) => scopes.onlyu(id_usuario, id_empresa))

     if (q) {
      query.where((qb) => {
        qb.whereILike('lugar', `%${q}%`).orWhereILike('descripcion', `%${q}%`)
      })
     }

     if(estado) query.andWhere('estado', estado)
     if(fechaDesde) query.andWhere('fecha', '>=', fechaDesde)
     if(fechaHasta) query.andWhere('fecha', '<=', fechaHasta)

      const orderMap: Record<string, string> = {
        fecha: ' fecha',
        created_at: ' created_at'
      }
      query.orderBy(orderMap[orderBy] ?? 'created_at', orderDir)

      return await query.paginate(page, perPage)
    
  }

  async obtenerUsuario(id:number, id_user: number, id_empresa: number) {
    const reporte = await Reporte.query()
    .apply((scopes) => scopes.onlyu(id_user, id_empresa))
    .where('id_reporte', id)
    .first()

    return reporte
   }

 public async verificarHuellaSGVA(
  reporteId: number,
  sgvaId: number,
  huellaCapturada: string
) {
  // Obtener reporte
  const reporte = await Reporte.query()
    .where('id_reporte', reporteId)
    .firstOrFail()

  // Obtener huella del SGVA
  const fingerprint = await Fingerprint.query()
    .where('id_usuario', sgvaId)
    .firstOrFail()

  const sgvaTemplate = Buffer.from(fingerprint.template as string).toString('base64')

  // Llamar a microservicio Python
  const pythonUrl = Env.get('PYTHON_SERVICE_URL', 'http://localhost:6000')
  const cmp = await axios.post(`${pythonUrl}/compare`, {
    t1: huellaCapturada,
    t2: sgvaTemplate
  })

  const score = cmp.data.score
  const estado = score >= 0.55 ? 'Aceptado' : 'Denegado'

  // Actualizar estado del reporte y mantener instancia
  reporte.merge({ estado })
  await reporte.save()

  return { estado, score, reporte }
}

async listarGeneral() {
    return await Reporte.all()
  }
}

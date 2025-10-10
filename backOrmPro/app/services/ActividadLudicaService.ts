import ActividadLudica from '#models/actividad_ludica'

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

export default class ActividadLudicaService {
  async crear(datos: any) {
    return await ActividadLudica.create(datos)
  }

  async listarPorEmpresa(id_empresa: number) {
    return await ActividadLudica.query().where('id_empresa', id_empresa)
  }

  async actualizar(id: number, datos: any, id_empresa: number) {
    const actividad = await ActividadLudica.query()
      .where('id', id)
      .where('id_empresa', id_empresa)
      .firstOrFail()

    actividad.merge(datos)
    await actividad.save()
    return actividad
  }

  async eliminar(id: number, id_empresa: number) {
    const actividad = await ActividadLudica.query()
      .where('id', id)
      .where('id_empresa', id_empresa)
      .firstOrFail()

    await actividad.delete()
    return { mensaje: 'Actividad eliminada correctamente' }
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

      const query = ActividadLudica.query().apply((scopes) => scopes.onlyu(id_usuario, id_empresa))

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
}

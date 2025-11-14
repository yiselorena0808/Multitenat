import ListaChequeo from "#models/lista_chequeo"

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

export default class ListaChequeoService {
  // Crear lista
  public async crear(datos: any, usuario: any) {
    return await ListaChequeo.create({
      ...datos,
      id_usuario: usuario.id,
      id_empresa: usuario.id_empresa,
    })
  }

  // Listar todas las listas de la empresa
  public async listar(idEmpresa: number) {
    return await ListaChequeo.query()
      .where('id_empresa', idEmpresa)
      .orderBy('fecha', 'desc')
  }

  // Listar una lista por ID
  public async listarPorId(idEmpresa: number, id: number) {
    return await ListaChequeo.query()
      .where('id_empresa', idEmpresa)
      .andWhere('id', id)
      .first()
  }

  // Actualizar lista
  public async actualizar(idEmpresa: number, id: number, datos: any) {
    const lista = await this.listarPorId(idEmpresa, id)
    if (!lista) return null

    lista.merge(datos)
    await lista.save()
    return lista
  }

  // Eliminar lista
  public async eliminar(idEmpresa: number, id: number) {
    const lista = await this.listarPorId(idEmpresa, id)
    if (!lista) return null

    await lista.delete()
    return true
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
  
        const query = ListaChequeo.query().apply((scopes) => scopes.onlyu(id_usuario, id_empresa))
  
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

    async listarGeneral() {
      return await ListaChequeo.all()
    }
}
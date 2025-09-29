import ListaChequeo from "#models/lista_chequeo"

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
}
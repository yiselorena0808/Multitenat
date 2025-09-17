import ListaChequeo from '#models/lista_chequeo'

class ListaChequeoService {
  async crear(usuario:any, datos: any) {
    const lista = await ListaChequeo.create({
      ...datos,
      id_empresa: usuario.id_empresa,
      id_usuario: usuario.id_usuario,
    })

    return lista
  }

  async listar(empresaId: number) {
    return await ListaChequeo.query().where('id_empresa', empresaId).orderBy('fecha', 'desc')
  }

  async listarId(id: number, empresaId: number) {
    return await ListaChequeo.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .first()
  }

 async actualizar(id: number, empresaId:number,datos: any) {
  const lista = await this.listarId(empresaId, id) // busca por primary key
   if(!lista) {
      return {error: 'lista no encontrada'}
   }

   if (empresaId && lista.id_empresa !== empresaId) {
     return { error: 'No autorizado para actualizar esta lista' }
   }

    lista.merge(datos)
    await lista.save()
    return lista
}
 

  async eliminar(id: number, empresaId: number) {
    const lista = await this.listarId(empresaId, id)
    if(!lista) {
      return { error: 'Lista no encontrada o no autorizada' }
    }

    await lista.delete()
    return { mensaje: 'Lista eliminada correctamente'}
  }

  async conteo() {
    const listas = await ListaChequeo.query()
    return {
      total: listas.length,
      listas,
    }
  }
}

export default ListaChequeoService
import Comentario from '#models/comentario'

export default class ComentarioService {
  async listar(tipoEntidad: string, idEntidad: number) {
    return Comentario.query()
      .where('tipo_entidad', tipoEntidad)
      .where('id_entidad', idEntidad)
      .orderBy('created_at', 'asc')
  }

  async crear(data: any) {
    return Comentario.create(data)
  }

  async buscarPorId(id: number) {
    return Comentario.find(id)
  }
}
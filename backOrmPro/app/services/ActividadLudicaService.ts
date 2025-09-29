import ActividadLudica from '#models/actividad_ludica'

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
}

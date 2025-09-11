import ActividadLudica from '#models/actividad_ludica'

class ActividadLudicaService {
  async crear(empresaId:number, datos:any) {
  console.log('Service.crear | datos recibidos:', datos, 'empresaId:', empresaId);
  const actividad = await ActividadLudica.create({
    ...datos,
    id_empresa: empresaId
  });
  console.log('Service.crear | actividad creada:', actividad);
  return actividad;
  }

  async listar(empresaId: number) {
      return await ActividadLudica.query().where('id_empresa', empresaId)
  }

  async listarId(id: number, empresaId: number) {
   return await ActividadLudica.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .first()
  }

  async actualizar(id:number, empresaId: number, datos: any) {
  const actividad = await ActividadLudica.find(id)
    if(!actividad){
      return {error: 'actividad no encontrada'}
    }

    if (empresaId && actividad.id_empresa !== empresaId) {
      return { error: 'No autorizado para actualizar esta actividad' }
    }

    actividad.merge(datos)
    await actividad.save()
    return actividad
  }

  async eliminar(id: number, empresaId: number) {
    const actividad = await ActividadLudica.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .first()

    if (!actividad) {
      return { error: 'Actividad no encontrada o no autorizada' }
    }

    await actividad.delete()
    return { mensaje: 'Actividad eliminada correctamente' }
  
  }

  async conteo() {
    const actividades = await ActividadLudica.query()
    return {
      total: actividades.length,
      actividades,
    }
  }
}

export default ActividadLudicaService

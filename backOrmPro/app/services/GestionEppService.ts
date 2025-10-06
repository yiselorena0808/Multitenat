import GestionEpp from '#models/gestion_epp'
import Cargo from '#models/cargo'

class GestionEppService {
  async crear(
  datos: Partial<GestionEpp>,
  usuario: any,
  id_producto?: number[],   // 👈 opcional
  id_cargo?: number           // 👈 opcional si quieres vincular a un cargo específico
) {
  const gestion = await GestionEpp.create({
    ...datos,
    id_usuario: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    id_empresa: usuario.id_empresa,
    id_area: usuario.id_area,
    id_cargo: id_cargo ?? null,
  })

  if (id_producto && id_producto.length > 0) {
    await gestion.related('productos').attach(id_producto)
  }

  return await gestion.preload('productos')
}

  async listar(empresaId: number) {
    return await GestionEpp.query()
      .where('id_empresa', empresaId)
      .preload('empresa')
      .preload('area')
      .preload('productos')
  }

  async listarId(id: number, empresaId: number) {
    return await GestionEpp.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .preload('empresa')
    .preload('area')
    .preload('productos')
    .first()
  }

  async actualizar(
  id: number,
  datos: Partial<GestionEpp>,
  id_producto: number[] | undefined,
  usuario: any
) {
  const gestion = await GestionEpp.query()
    .where('id', id) // 👈 clave correcta
    .andWhere('id_empresa', usuario.id_empresa)
    .first()

  if (!gestion) {
    throw new Error('Gestión no encontrada')
  }

  gestion.merge(datos)
  await gestion.save()

  if (Array.isArray(id_producto)) {
    await gestion.related('productos').sync(id_producto)
  }

  return await gestion.preload('productos')
}


  async eliminar(id: any, empresaId: number) {
    const gestion = await GestionEpp.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()

    if (!gestion) {
      throw new Error('Gestión no encontrada')
    }

    await gestion.delete()
    return { mensaje: 'Gestión eliminada'}
  }

  async conteo() {
    const gestiones = await GestionEpp.query()
    return {
      total: gestiones.length,
      gestiones,
    }
  }
  
async productosPorCargo(id_cargo: number) {
  const cargo = await Cargo.findOrFail(id_cargo)
  await cargo.load('productos', (query) => query.where('estado', true))
  return cargo.productos
}
}

export default GestionEppService
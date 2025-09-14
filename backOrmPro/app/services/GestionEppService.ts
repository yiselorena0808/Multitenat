import GestionEpp from '#models/gestion_epp'
import Producto from '#models/producto'

class GestionEppService {
  async crear(
    datos: Partial<GestionEpp>,
    productosIds: number[],
    usuario: any // usuario logueado
  ) {
    const gestion = await GestionEpp.create({
      ...datos,
      id_usuario: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      cargo: usuario.cargo,
      id_empresa: usuario.id_empresa,
      id_area: usuario.id_area,
    })

    if (productosIds && productosIds.length > 0) {
      await gestion.related('productos').attach(productosIds)
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
    productosIds: number[] | undefined,
    usuario: any
  ) {
    const gestion = await GestionEpp.query()
      .where('id', id)
      .andWhere('id_empresa', usuario.id_empresa)
      .first()

    if (!gestion) throw new Error('Gestión no encontrada')

    gestion.merge(datos)
    await gestion.save()

    if (productosIds) {
      await gestion.related('productos').sync(productosIds)
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
  async productosPorCargo(cargo: string) {
    return await Producto.query()
      .where('cargo_asignado', cargo)
      .andWhere('estado', true)
  }
}

export default GestionEppService
// start/services/cargoService.ts
import Cargo from '#models/cargo'
import Producto from '#models/producto'

export default class CargoService {
  public async listar() {
    return await Cargo.all()
  }

  public async crear(data: { cargo: string }) {
    const cargo = await Cargo.create(data)
    return cargo
  }

  public async actualizar(id_cargo: number, data: { cargo: string }) {
    const cargo = await Cargo.findOrFail(id_cargo)
    cargo.merge(data)
    await cargo.save()
    return cargo
  }

  public async eliminar(id_cargo: number) {
    const cargo = await Cargo.findOrFail(id_cargo)
    await cargo.delete()
  }

  public async productosPorCargoId(id_cargo: number) {
    const cargo = await Cargo.query().where('id_cargo', id_cargo).preload('productos').firstOrFail()
    return cargo.productos
  }

  public async productosPorCargoNombre(nombre: string) {
    const cargo = await Cargo.query().where('cargo', nombre).preload('productos').firstOrFail()
    return cargo.productos
  }

  async vincularProductos(cargoId: number, productosIds: number[]) {
    const cargo = await Cargo.findOrFail(cargoId)
    await cargo.related('productos').attach(productosIds) 
    return await cargo.load('productos')
  }

  async desvincularProductos(cargoId: number, productosIds: number[]) {
    const cargo = await Cargo.findOrFail(cargoId)
    await cargo.related('productos').detach(productosIds)
    return await cargo.load('productos')
  }

  async reemplazarProductos(cargoId: number, productosIds: number[]) {
    const cargo = await Cargo.findOrFail(cargoId)
    await cargo.related('productos').sync(productosIds) 
    return await cargo.load('productos')
  }

  async crearProductoYAsociar(cargoId: number, data: any) {
    const cargo = await Cargo.findOrFail(cargoId)
    const producto = await Producto.create(data)

    // lo asocia en la tabla pivote
    await cargo.related('productos').attach([producto.id_producto])

    return producto
  }

  // Asociar un producto existente a un cargo
  async asociarProductoExistente(cargoId: number, productoId: number) {
    const cargo = await Cargo.findOrFail(cargoId)
    await cargo.related('productos').attach([productoId])
    return await cargo.load('productos')
  }

  // Listar productos de un cargo
  async listarProductos(cargoId: number) {
    const cargo = await Cargo.query().where('id', cargoId).preload('productos').firstOrFail()
    return cargo.productos
  }

}

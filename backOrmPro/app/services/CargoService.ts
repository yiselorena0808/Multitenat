// start/services/cargoService.ts
import Cargo from '#models/cargo'

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
}

import Cargo from "#models/cargo";

export default class CargoService {
  async crear(empresaId: number, datos: any) {
      const cargo = await Cargo.create({
        ...datos,
        id_empresa: empresaId,
      })
  
      return cargo
    }
  
    async listar(empresaId: number) {
      return await Cargo.query().where('id_empresa', empresaId)
    }
  
    async listarId(id: number, empresaId: number) {
      return await Cargo.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()
    }
  
   async actualizar(id: number, empresaId:number,datos: any) {
    const cargo = await Cargo.find(id) // busca por primary key
     if(!cargo) {
        return {error: 'cargo no encontrado'}
     }
  
     if (empresaId && cargo.id_empresa !== empresaId) {
       return { error: 'No autorizado para actualizar este cargo' }
     }
  
      cargo.merge(datos)
      await cargo.save()
      return cargo
  }
   
  
    async eliminar(id: number, empresaId: number) {
      const cargo = await Cargo.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()
  
      if(!cargo) {
        return { error: 'Cargo no encontrado o autorizado' }
      }
  
      await cargo.delete()
      return { mensaje: 'Cargo eliminado correctamente'}
    }
    
    async  asociarProductosACargo(cargoId: number, productosIds: number[]) {
    const cargo = await Cargo.findOrFail(cargoId)
    await cargo.related('productos').attach(productosIds)
    await cargo.load('productos')
    return cargo
     }
}
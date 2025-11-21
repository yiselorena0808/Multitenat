import Producto from "#models/producto"
import Cargo from "#models/cargo"

export default class ProductoService {
 async crearProducto(data: {
    nombre: string
    descripcion?: string | null
    estado?: boolean
  }) {
    return await Producto.create(data)
  }

  // Listar productos, opcionalmente filtrados por cargoId
  async listarProductos(cargoId?: number) {
    if (cargoId) {
      const cargo = await Cargo.findOrFail(cargoId)
      await cargo.load('productos', (query) => query.where('estado', true))
      return cargo.productos
    }
    return await Producto.query().where('estado', true)
  }

  // Obtener un producto por ID
  async obtenerProducto(id: number) {
    return await Producto.findOrFail(id)
  }

  // Actualizar un producto
  async actualizarProducto(id: number, data: {
    nombre?: string
    descripcion?: string | null
    estado?: boolean
  }) {
    const producto = await Producto.findOrFail(id)
    producto.merge(data)
    await producto.save()
    return producto
  }

  // Eliminar un producto
  async eliminarProducto(id: number) {
    const producto = await Producto.findOrFail(id)
    await producto.delete()
    return { message: 'Producto eliminado con éxito' }
  }

  async listarPorCargoId(id_cargo: number) {
    const cargo = await Cargo.query()
      .where('id_cargo', id_cargo)   // 👈 usa el nombre real de la PK
      .preload('productos')
      .firstOrFail()

    return cargo.productos
  }

  // Listar productos por nombre de cargo
  async listarPorCargoNombre(nombreCargo: string) {
    const cargo = await Cargo.query()
      .where('cargo', nombreCargo)  // o 'nombre_cargo' / 'nombre', según tu BD
      .preload('productos')
      .firstOrFail()

    return cargo.productos
  }

 async listarGeneral () {
    return await Producto.all()
  }

    async asignarProductoACargo(cargoId: number, productoId: number) {
    const cargo = await Cargo.findOrFail(cargoId)

    // crea el registro en cargo_productos (cargo_id, producto_id)
    await cargo.related('productos').attach([productoId])

    // opcional: recargar productos para devolverlos actualizados
    await cargo.load('productos')
    return cargo.productos
  }

}

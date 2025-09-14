import Producto from "#models/producto"

export default class ProductoService {
  // Crear producto
  async crearProducto(data: {
    nombre: string
    descripcion?: string | null
    cargo_asignado?: string
    estado?: boolean
  }) {
    const producto = await Producto.create(data)
    return producto
  }

  // Listar productos, opcionalmente filtrados por cargo
  async listarProductos(cargo?: string) {
    const query = Producto.query().where('estado', true)
    if (cargo) {
      query.andWhere('cargo_asignado', cargo)
    }
    return query
  }

  // Obtener un producto por ID
  async obtenerProducto(id: number) {
    const producto = await Producto.find(id)
    if (!producto) throw new Error('Producto no encontrado')
    return producto
  }

  // Actualizar un producto
  async actualizarProducto(id: number, data: {
    nombre?: string
    descripcion: string | null
    cargo_asignado: string
    estado?: boolean
  }) {
    const producto = await Producto.find(id)
    if (!producto) throw new Error('Producto no encontrado')
    producto.merge(data)
    await producto.save()
    return producto
  }

  // Eliminar un producto
  async eliminarProducto(id: number) {
    const producto = await Producto.find(id)
    if (!producto) throw new Error('Producto no encontrado')
    await producto.delete()
    return { message: 'Producto eliminado con éxito' }
  }
}

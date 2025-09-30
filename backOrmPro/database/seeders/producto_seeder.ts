import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Producto from '#models/producto'

export default class extends BaseSeeder {
  async run() {
    await Producto.create({
      nombre: 'Herramientas',
      descripcion: 'Descripcion del producto 1',
      cargo_asignado: 'SGVA',
      estado: true
    })
  }
}
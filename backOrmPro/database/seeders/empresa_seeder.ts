import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Empresa from '#models/empresa'

export default class extends BaseSeeder {
  async run() {
    await Empresa.create({
      nombre: 'Empresa Demo',
      nit: '123456789',
      direccion: 'Calle Falsa 123',
      estado: true,
      esquema: null,
      alias: null

  })
}
}
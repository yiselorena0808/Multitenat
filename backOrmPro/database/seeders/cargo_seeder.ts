import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Cargo from '#models/cargo'

export default class extends BaseSeeder {
  async run() {
    await Cargo.create({
      cargo: 'SGVA',
      id_empresa: 1,
      id_gestion: 1
    })
  }
}
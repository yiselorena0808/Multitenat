import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Area from '../../app/models/area.js'

export default class extends BaseSeeder {
  async run() {
    await Area.create({
      nombre: 'Recursos Humanos',
      codigo: 'RRHH',
      descripcion: 'Area encargada de la gestion del talento humano',
      id_empresa: 1,
      estado: true,
      esquema: null,
      alias: null
    })
  }
}
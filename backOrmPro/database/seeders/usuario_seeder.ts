import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Usuario from '#models/usuario'

export default class extends BaseSeeder {
  async run() {
    await Usuario.create({
      nombre: 'Juan',
      apellido: 'Perez',
      nombre_usuario: 'jperez',
      id_empresa: 1,
      id_area: 1,
      cargo: 'SGVA',
      correo_electronico: 'jperez@mail.com',
      contrasena: '12345',
      
  })
}
}
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import EmpresaSeeder from './empresa_seeder.js'
import AreaSeeder from './area_seeder.js'
import CargoSeeder from './cargo_seeder.js'
import ProductoSeeder from './producto_seeder.js'
import UsuarioSeeder from './usuario_seeder.js'

export default class MainSeeder extends BaseSeeder {
  public async run () {
    await new EmpresaSeeder(this.client).run()
    await new AreaSeeder(this.client).run()
    await new CargoSeeder(this.client).run()
    await new ProductoSeeder(this.client).run()
    await new UsuarioSeeder(this.client).run()
  }
}

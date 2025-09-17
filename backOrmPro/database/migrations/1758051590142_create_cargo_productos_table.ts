import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CargoProductos extends BaseSchema {
  protected tableName = 'cargo_productos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('cargo_id').unsigned().references('id_cargo').inTable('cargos').onDelete('CASCADE')
      table.integer('producto_id').unsigned().references('id').inTable('productos').onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
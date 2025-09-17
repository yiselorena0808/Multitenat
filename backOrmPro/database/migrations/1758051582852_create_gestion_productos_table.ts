import { BaseSchema } from '@adonisjs/lucid/schema'

export default class GestionEppProductos extends BaseSchema {
  protected tableName = 'gestion_epp_productos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('gestion_id').unsigned().references('id').inTable('gestion_epp').onDelete('CASCADE')
      table.integer('producto_id').unsigned().references('id').inTable('productos').onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
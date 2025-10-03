import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'area'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_area')
      table.string('nombre')
      table.string('codigo')
      table.text('descripcion').nullable()
      table.integer('id_empresa').notNullable().references('id_empresa').inTable('empresas').onDelete('CASCADE')
      table.boolean('estado').defaultTo(true)
      table.string('esquema').nullable()
      table.string('alias').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

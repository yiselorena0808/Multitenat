import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cargos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_cargo')
      table.string('cargo').notNullable()
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
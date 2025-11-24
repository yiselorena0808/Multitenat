import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'huellas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_usuario').notNullable().unsigned().references('id').inTable('usuarios').onDelete('CASCADE')
      table.text('huella_template').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
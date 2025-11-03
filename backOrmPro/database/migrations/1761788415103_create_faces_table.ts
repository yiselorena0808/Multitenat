import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'faces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_face')
      table.integer('id_usuario').unsigned().references('id').inTable('usuarios').notNullable().onDelete('CASCADE')
      table.specificType('descriptor', 'float8[]').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
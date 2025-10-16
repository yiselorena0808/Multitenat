import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comentarios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('contenido').notNullable()
      table.string('tipo_entidad').notNullable()
      table.integer('id_entidad').notNullable()
      table.integer('id_usuario').notNullable()
      table.string('nombre_usuario').notNullable()
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
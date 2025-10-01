import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cargos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_cargo')
      table.string('cargo').notNullable()
      table.integer('id_empresa').references('id_empresa').inTable('empresas')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.integer('id_gestion').references('id').inTable('gestion_epp')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
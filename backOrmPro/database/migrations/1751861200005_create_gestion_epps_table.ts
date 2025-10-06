import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gestion_epp'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_usuario').unsigned()
        .references('id')
        .inTable('usuarios')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.string('nombre')
      table.string('apellido')
      table.string('cedula')
      table.integer('cantidad')
      table.string('importancia')
      table.boolean('estado').nullable()
      table.integer('id_cargo').references('id_cargo').inTable('cargos')
        .onDelete('SET NULL').onUpdate('CASCADE')
        .nullable()
      table.integer('id_empresa').references('id_empresa').inTable('empresas')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.integer('id_area').references('id_area').inTable('area')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.date('fecha_creacion')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lista_chequeos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_usuario').references('id')
        .inTable('usuarios')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.string('usuario_nombre')
      table.date('fecha')
      table.time('hora')
      table.string('modelo')
      table.string('marca')
      table.string('soat')
      table.string('tecnico')
      table.string('kilometraje')
      table.string('placa')
      table.string('observaciones')
      table.integer('id_empresa').references('id_empresa').inTable('empresas')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'eventos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
       table.integer('id_usuario').unsigned().notNullable()
        .references('id').inTable('usuarios')
        .onDelete('CASCADE')  
        .onUpdate('CASCADE')
      table.string('nombre_usuario')
      table.string('titulo')
      table.date('fecha_actividad')
      table.text('descripcion')
      table.text('imagen')
      table.integer('id_empresa').references('id_empresa').inTable('empresas')
        .onDelete('CASCADE').onUpdate('CASCADE')
        .notNullable()
      table.text('archivo')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

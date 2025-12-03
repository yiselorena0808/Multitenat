import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notificaciones'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // 🔥 FOREIGN KEY A USUARIO (tabla: usuarios, columna: id)
      table.integer('usuario_id')
        .unsigned()
        .references('id')
        .inTable('usuarios')
        .onDelete('CASCADE')
      
      // 🔥 FOREIGN KEY A REPORTE (tabla: reportes, columna: id_reporte)
      table.integer('id_reporte')
        .unsigned()
        .references('id_reporte')
        .inTable('reportes')
        .onDelete('CASCADE')
      
      table.text('mensaje').notNullable()
      table.boolean('leida').defaultTo(false)
      table.timestamp('fecha').defaultTo(this.now())
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'asesoramientos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_asesoramiento')
      table.string('titulo', 255).notNullable()
      table.text('descripcion').notNullable()
      table.string('imagen_video', 255).nullable()
      table.string('archivo_adjunto', 255).nullable()
      table.text('referencias').notNullable()
      table.integer('id_empresa').unsigned().notNullable()
      table.integer('id_usuario').unsigned().notNullable()


      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
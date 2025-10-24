import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fingerprints'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // relación 1–1 con users
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique()                  // cada user solo una huella

      // === A) Guardar binario (Buffer) ===
      //table.binary('template').notNullable()
      // En Postgres será BYTEA, en MySQL VARBINARY

      // --- B) Guardar base64 como texto (si prefieres) ---
       table.text('template', 'longtext').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['user_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
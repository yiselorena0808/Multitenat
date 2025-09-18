import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PasswordResetTokens extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('usuarios').onDelete('CASCADE')
      table.string('token', 64).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

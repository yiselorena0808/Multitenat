import { BaseSchema } from '@adonisjs/lucid/schema'


export default class AddTipoToNotificaciones extends BaseSchema {
  protected tableName = 'notificaciones'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tipo').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipo')
    })
  }
}

import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class Huella extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_usuario: number

  @column()
  declare huella_template: String

}
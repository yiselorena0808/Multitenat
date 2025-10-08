import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Asesoramiento extends BaseModel {
  @column({ isPrimary: true })
  declare id_asesoramiento: number

  @column()
  declare titulo: string

  @column()
  declare descripcion: string

  @column()
  declare imagen_video: string | null
  
  @column()
  declare archivo_adjunto: string | null

  @column()
  declare referencias: string

  @column()
  declare id_empresa: number

  @column()
  declare id_usuario: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Comentario extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare contenido: string

  @column()
  declare tipoEntidad: string   // Ej: "reporte", "actividad", "epp", "lista"

  @column()
  declare idEntidad: number     // ID del registro relacionado

  @column()
  declare idUsuario: number

  @column()
  declare nombreUsuario: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
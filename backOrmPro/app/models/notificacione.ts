import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Usuario from './usuario.js'
import Reporte from './reporte.js'

export default class Notificacion extends BaseModel {

  public static table = 'notificaciones' 
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare usuario_id: number

  @column()
  declare mensaje: string

  @column()
  declare id_reporte?: number | null

  @column()
  declare leida: boolean

  @column()
  declare tipo?: string | null

  @column.dateTime({ autoCreate: true })
  declare fecha: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // 🔥 RELACIÓN CON USUARIO (corregida según tu modelo)
  @belongsTo(() => Usuario, {
    foreignKey: 'usuario_id' // Este es el campo en notificaciones
  })
  declare usuario: BelongsTo<typeof Usuario>


  @belongsTo(() => Reporte, {
    foreignKey: 'id_reporte' // Este es el campo en notificaciones
  })
  declare reporte: BelongsTo<typeof Reporte>
}
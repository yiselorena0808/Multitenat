import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Usuario from './usuario.js'
import Empresa from './empresa.js'
import type {BelongsTo} from '@adonisjs/lucid/types/relations'

export default class ActividadLudica extends BaseModel {
   public static table = 'actividades_ludicas'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_usuario:number

  @column()
  declare nombre_usuario: string

  @column()
  declare nombre_actividad: string

  @column()
  declare fecha_actividad: string

  @column()
  declare descripcion: string

  @column()
  declare imagen_video: string | null

  @column()
  declare archivo_adjunto: string | null

  @column()
  declare id_empresa: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Usuario)
  declare usuario: BelongsTo<typeof Usuario>

  @belongsTo(() => Empresa)
  declare empresa: BelongsTo<typeof Empresa>
}

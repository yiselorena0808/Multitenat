import Usuario from './usuario.js'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Face extends BaseModel {
  @column({ isPrimary: true })
  declare id_face: number

  @column()
  declare id_usuario: number
  
  @column()
  declare descriptor: Buffer

  @belongsTo(() => Usuario)
    declare usuario: BelongsTo<typeof Usuario>

}
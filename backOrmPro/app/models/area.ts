import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Usuario from './usuario.js'
import { DateTime } from 'luxon'
import Empresa from './empresa.js'

export default class Area extends BaseModel {
 public static table = 'area'

  @column({ isPrimary: true })
  declare id_area: number
  
   @column()
  declare nombre: string

  @column()
  declare codigo: string

  @column()
  declare descripcion: string | null

  @column()
  declare id_empresa: number

  @column()
  declare estado: boolean

  @column()
  declare esquema: string | null

  @column()
  declare alias: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Usuario, {
    foreignKey: 'id_area'
  })
    declare usuarios: HasMany<typeof Usuario>

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
    declare empresa: BelongsTo<typeof Empresa>

}

import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import Empresa from './empresa.js'

export default class Cargo extends BaseModel {
  @column({ isPrimary: true })
  declare id_cargo: number

  @column()
  declare cargo: String

  @column()
  declare id_empresa: number

  @belongsTo(() => Empresa)
  declare empresa: BelongsTo<typeof Empresa>

}
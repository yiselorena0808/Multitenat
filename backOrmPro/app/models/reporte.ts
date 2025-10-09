import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Usuario from './usuario.js'
import Empresa from './empresa.js'

export default class Reporte extends BaseModel {
  @column({ isPrimary: true })
  declare id_reporte: number

  @column()
  declare id_usuario: number

  @column()
  declare nombre_usuario: string

  @column()
  declare cargo: string

  @column()
  declare cedula: string

  @column()
  declare fecha: string

  @column()
  declare lugar: string

  @column()
  declare descripcion: string

  @column()
  declare imagen: string

  @column()
  declare archivos: string

  @column()
  declare estado: string

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

     static onlyu = scope((query, userId: number, empresaId: number) => {
    query.where('id_usuario', userId).andWhere('id_empresa', empresaId)
  })
}

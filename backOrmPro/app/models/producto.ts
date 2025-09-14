import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import GestionEpp from '#models/gestion_epp'

export default class Producto extends BaseModel {
  public static table = 'productos'

  @column({ isPrimary: true })
  declare id_producto: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column()
  declare cargo_asignado: string

  @column()
  declare estado: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => GestionEpp, {
    pivotTable: 'gestion_epp_productos',
    localKey: 'id_producto',
    pivotForeignKey: 'producto_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'gestion_id',
  })
  declare gestiones: ManyToMany<typeof GestionEpp>
}

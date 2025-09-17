import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import Empresa from './empresa.js'
import GestionEpp from './gestion_epp.js'
import Producto from './producto.js'

export default class Cargo extends BaseModel {
  @column({ isPrimary: true })
  declare id_cargo: number

  @column()
  declare cargo: String

  @column()
  declare id_empresa: number

  @column()
  declare id_gestion: number

  @column()
  declare id_producto: number

  @belongsTo(() => Empresa)
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => GestionEpp)
  declare gestion: BelongsTo<typeof GestionEpp>

  @manyToMany(() => Producto, {
      pivotTable: 'cargo_productos',
      localKey: 'id_cargo',
      pivotForeignKey: 'cargo_id',
      relatedKey: 'id_producto',
      pivotRelatedForeignKey: 'proucto_id',
    })
    declare productos: ManyToMany<typeof Producto>
}
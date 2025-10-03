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
  declare cargo: string

  @column()
  declare id_empresa: number

  @column()
  declare id_gestion: number   // 👈 un cargo pertenece a una gestión

  @belongsTo(() => Empresa, { foreignKey: 'id_empresa' })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => GestionEpp, { foreignKey: 'id_gestion' })
  declare gestion: BelongsTo<typeof GestionEpp>

  @manyToMany(() => Producto, {
    pivotTable: 'cargo_productos',
    localKey: 'id_cargo',
    pivotForeignKey: 'id_cargo',
    relatedKey: 'id_producto',
    pivotRelatedForeignKey: 'id_producto',
  })
  declare productos: ManyToMany<typeof Producto>
}

import { BaseModel, column, manyToMany,hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'
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



  @belongsTo(() => Empresa, { foreignKey: 'id_empresa' })
  declare empresa: BelongsTo<typeof Empresa>

  @hasMany (() => GestionEpp, {
    foreignKey: 'id_cargo',
  })
  declare gestionEpps: HasMany<typeof GestionEpp>

  @manyToMany(() => Producto, {
    pivotTable: 'cargo_productos',
    pivotForeignKey: 'cargo_id',
    pivotRelatedForeignKey: 'producto_id',
  })
  declare productos: ManyToMany<typeof Producto>
}

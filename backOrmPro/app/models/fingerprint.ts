
import { BaseModel, column, belongsTo} from '@adonisjs/lucid/orm'
import type {BelongsTo} from '@adonisjs/lucid/types/relations'
import Usuario from './usuario.js' // o ruta relativa: '../../models/user.js'

export default class Fingerprint extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'id_usuario' })
  declare idUsuario: number

  @column()
  declare template: Buffer 

  @belongsTo(() => Usuario, {foreignKey: 'id_usuario'})
  declare user: BelongsTo<typeof Usuario>
}

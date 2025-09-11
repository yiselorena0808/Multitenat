import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Empresa from './empresa.js'
import Area from './area.js'
import Reporte from './reporte.js'
import PublicacionBlog from './publicacion_blog.js'
import GestionEpp from './gestion_epp.js'
import ListaChequeo from './lista_chequeo.js'
import ActividadLudica from './actividad_ludica.js'


const AuthUsuario = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['correo_electronico'],    // identificador para login
  passwordColumnName: 'contrasena' // campo donde está la contraseña
})

export default class Usuario extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare apellido: string

  @column({ columnName: 'nombre_usuario' })
  declare nombre_usuario: string

  @column({ columnName: 'correo_electronico' })
  declare correo_electronico: string

  @column()
  declare cargo: string

  @column()
  declare contrasena: string

  @column({ columnName: 'id_empresa' })
  declare id_empresa: number

  @column({ columnName: 'id_area' })
  declare id_area: number

  @belongsTo(() => Empresa, { foreignKey: 'id_empresa' })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => Area, { foreignKey: 'id_area' })
  declare area: BelongsTo<typeof Area>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relaciones con otras entidades
  @hasMany(() => GestionEpp)
  declare gestionEpp: HasMany<typeof GestionEpp>

  @hasMany(() => PublicacionBlog)
  declare publicacionBlogs: HasMany<typeof PublicacionBlog>

  @hasMany(() => Reporte)
  declare reportes: HasMany<typeof Reporte>

  @hasMany(() => ListaChequeo)
  declare listaChequeos: HasMany<typeof ListaChequeo>

  @hasMany(() => ActividadLudica)
  declare actividadesLudicas: HasMany<typeof ActividadLudica>

  

   static accessTokens = DbAccessTokensProvider.forModel(Usuario)

   public async beforeSave() {
    if (this.$dirty.contrasena) {
      this.contrasena = await hash.make(this.contrasena)
    }
  }


  
}

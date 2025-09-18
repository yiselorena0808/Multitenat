import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PasswordResetToken extends BaseModel {
  public static table = 'password_reset_tokens'

  @column({ isPrimary: true })
  public id?: number

  @column()
  public user_id?: number

  @column()
  public token?: string

  @column.dateTime({ autoCreate: true })
  public created_at?: DateTime
}

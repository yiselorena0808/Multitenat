
import type { HttpContext } from '@adonisjs/core/http'
import { fcm } from '#start/firebase'

export default class DebugFcmController {
  async health({ response }: HttpContext) {
    try {
      // mensaje mínimo válido; dryRun=true => solo valida
      const messageId = await fcm.send(
        { topic: 'health_check_topic', notification: { title: 'Health', body: 'OK' } },
        true // dryRun
      )
      return response.ok({ ok: true, dryRun: true, messageId })
    } catch (e: any) {
      return response.badRequest({ ok: false, error: e.message ?? String(e) })
    }
  }
}

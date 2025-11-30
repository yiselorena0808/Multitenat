import { topicForTenant, topicForTenantRole } from '../utils/fcm_topics.js'
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

  async sendToTenant({ request, response }: HttpContext) {
    const { tenantId, title = 'Test', body = 'Hola 👋' } = request.only(['tenantId', 'title', 'body'])
    try {
      const topic = topicForTenant(Number(tenantId))
      const id = await fcm.send({
        topic,
        notification: { title, body },
        data: { tenantId: String(tenantId), eventId: '123' },
        android: { priority: 'high' },
      })
      return response.ok({ ok: true, topic, messageId: id })
    } catch (e: any) {
      return response.badRequest({ ok: false, error: e.message ?? String(e) })
    }
  }

  public async registerWebToken({ request, auth, response }: HttpContext) {
    const { token, tenantId, role } = request.only(['token', 'tenantId', 'role'])

    // Opcional: validar que tenantId y role correspondan al usuario autenticado
    const user = auth.user
    if (!user) {
      return response.unauthorized()
    }

    // Aquí puedes usar user.tenantId y user.role en vez de confiar en el body
    const topic = topicForTenantRole(tenantId, role)

    await fcm.subscribeToTopic(token, topic)

    return { ok: true, topic }
  }
}

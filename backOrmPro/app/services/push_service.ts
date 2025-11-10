import { fcm } from '#start/firebase'
import { topicForTenant } from '../utils/fcm_topics.js'

export async function notifyTenantNewEvent(
  tenantId: number,
  eventId: number,
  name: string
) {
  await fcm.send({
    topic: topicForTenant(tenantId),
  notification: { title: 'Nuevo evento 🎉', body: `Se creó “${name}”` },
    data: {
      type: 'event',
      tenantId: String(tenantId),
      eventId: String(eventId),
    },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}
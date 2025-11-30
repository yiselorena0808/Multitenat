import { fcm } from '#start/firebase'
import { topicForTenant, topicForTenantRole } from '../utils/fcm_topics.js'

export async function notifyTenantNewEvent(
  tenantId: number,
  eventId: number,
  name: string
) {
  await fcm.send({
    topic: topicForTenant(tenantId),
  notification: { title: 'Nuevo evento disponible', body: `Se creó “${name}”` },
    data: {
      type: 'event',
      tenantId: String(tenantId),
      eventId: String(eventId),
    },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}

export async function notifyTenantNewEventToRole(
  tenantId: number,
  role: string,      
  eventId: number,
  name: string
) {
  await fcm.send({
    topic: topicForTenantRole(tenantId, role),
    notification: { title: 'Hay un nuevo reporte por revisar', body: `Se creó “${name}”` },
    data: {
      type: 'event',
      tenantId: String(tenantId),
      eventId: String(eventId),
      role, 
    },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}
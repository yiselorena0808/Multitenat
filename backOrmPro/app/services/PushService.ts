// app/services/push_service.ts
import { fcm } from '#start/firebase'

export async function notifyCompanyNewEvent(companyId: number, eventId: number, name: string) {
  await fcm.send({
    topic: `company_${companyId}`,
    notification: { title: 'Nuevo evento 🎉', body: `Se creó “${name}”` },
    data: { type: 'event', eventId: String(eventId) },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}

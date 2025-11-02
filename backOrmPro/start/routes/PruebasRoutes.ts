// start/routes.ts
import router from '@adonisjs/core/services/router'
const DebugFcmController = () => import('../../app/controller/FCMController.js')
import { FACE_READY, FACE_ERROR } from '#start/face_models_boot'

router.get('/debug/fcm/health', [DebugFcmController, 'health'])
router.post('/debug/fcm/send', [DebugFcmController, 'sendToTenant'])
router.post('/debug/fcm/sends', async ({ request, response }) => {
  const { tenantId } = request.only(['tenantId'])
  const prefix = process.env.FCM_TOPIC_PREFIX || 'prod'
  const topic = `${prefix}_tenant_${Number(tenantId)}`
  console.log('[DEBUG] Enviando a topic:', topic)

  const { fcm } = await import('#start/firebase')
  try {
    const id = await fcm.send({
      topic,
      notification: { title: 'Ping', body: 'Desde backend' },
      data: { tenantId: String(tenantId), eventId: '123' },
      android: { priority: 'high' },
    })
    return response.ok({ ok: true, topic, messageId: id })
  } catch (e: any) {
    console.error('FCM error:', e?.message || e)
    return response.badRequest({ ok: false, topic, error: String(e) })
  }
})

router.get('/face/status', async () => {
  return {
    ready: FACE_READY,     // true cuando los modelos cargaron bien // ej: 'tfjs-js'
    error: FACE_ERROR,     // mensaje si falló el boot
  }
})

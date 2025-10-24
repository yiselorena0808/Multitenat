// start/routes.ts
import router from '@adonisjs/core/services/router'
const DebugFcmController = () => import('../../app/controller/FCMController.js')

router.get('/debug/fcm/health', [DebugFcmController, 'health'])
router.post('/debug/fcm/send', [DebugFcmController, 'sendToTenant'])



// src/helpers/FcmHelper.ts
import axios, { AxiosResponse } from 'axios'

/**
 * FCM solo acepta valores string en `data`.
 * Si necesitas enviar números/booleans, conviértelos a string.
 */
export type FcmData = Record<string, string>

export interface EnviarNotificacionParams {
  titulo: string
  cuerpo: string
  topic: string
  data?: FcmData
}

export interface FcmLegacySuccess {
  multicast_id: number
  success: number
  failure: number
  canonical_ids: number
  results: Array<{ message_id?: string; error?: string }>
}

export default class FcmHelper {
  private static readonly url = 'https://fcm.googleapis.com/fcm/send'

  /**
   * Envía una notificación usando la API Legacy de FCM (Server Key).
   * Recomendación: para producción, considera usar `firebase-admin` (HTTP v1).
   */
  static async enviarNotificacion(
    params: EnviarNotificacionParams
  ): Promise<FcmLegacySuccess | undefined> {
    const { titulo, cuerpo, topic, data = {} } = params

    const serverKey = process.env.FIREBASE_SERVER_KEY
    if (!serverKey) {
      throw new Error('FIREBASE_SERVER_KEY no está definida en las variables de entorno')
    }
    if (!topic) {
      throw new Error('Topic requerido')
    }

    const payload = {
      to: `/topics/${topic}`,
      notification: {
        title: titulo,
        body: cuerpo,
        sound: 'default',
        click_action: 'OPEN_EVENT_DETAIL', // opcional
      },
      // OJO: en FCM legacy `data` debe ser un mapa de strings
      data,
      android: {
        priority: 'high' as const,
      },
    }

    try {
      const response: AxiosResponse<FcmLegacySuccess> = await axios.post(
        FcmHelper.url,
        payload,
        {
          headers: {
            Authorization: `key=${serverKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      console.log('✅ Notificación enviada:', response.data)
      return response.data
    } catch (error: any) {
      // Muestra error devuelto por FCM si existe
      const detail = error?.response?.data ?? error?.message ?? 'Error desconocido'
      console.error('❌ Error al enviar notificación:', detail)
      throw error
    }
  }
}

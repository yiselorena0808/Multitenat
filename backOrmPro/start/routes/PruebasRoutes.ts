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

// imports ESM
import * as net from 'node:net';
import { promises as dns } from 'node:dns';
import pg from 'pg';
const { Client } = pg;

type EnvResponse = {
  host?: string;
  port: number;
  user?: string;
  database?: string;
  hasPassword: boolean;
};

const DB = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// 1) Ver envs (sanitizado)
router.get('/_diag/env', async (ctx: any) => {
  const envResponse: EnvResponse = {
    host: DB.host,
    port: DB.port,
    user: DB.user,
    database: DB.database,
    hasPassword: Boolean(DB.password),
  };
  return ctx.response.json(envResponse);
});

// 2) Test de socket TCP (equivalente a `nc`)
router.get('/_diag/socket', async (ctx: any) => {
  try {
    const { address, family } = await dns.lookup(String(DB.host));
    await new Promise<void>((resolve, reject) => {
      const s = net.createConnection({ host: String(DB.host), port: DB.port });
      const t = setTimeout(() => { s.destroy(); reject(new Error('TIMEOUT')); }, 4000);
      s.once('connect', () => { clearTimeout(t); s.destroy(); resolve(); });
      s.once('error', reject);
    });
    return ctx.response.json({ ok: true, resolved: { address, family }, port: DB.port });
  } catch (e: any) {
    return ctx.response.status(500).json({ ok: false, code: e.code ?? e.message });
  }
});

// 3) Test de conexión PG (SELECT 1) con SSL
router.get('/_diag/pg', async (ctx: any) => {
  const client = new Client({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    database: DB.database,
    ssl: { rejectUnauthorized: false },
  } as any);

  try {
    await client.connect();
    const r = await client.query('select 1 as ok');
    await client.end();
    return ctx.response.json({ ok: r.rows?.[0]?.ok === 1 });
  } catch (e: any) {
    await client.end().catch(() => {});
    return ctx.response.status(500).json({ ok: false, code: e.code, message: e.message });
  }
});

// 4) Healthcheck simple
router.get('/healthz', (ctx: any) => ctx.response.send('ok'));


router.post('/debug-public', async ({ response }) => {
  console.log('ENTRA A /debug-public')
  return response.ok({ ok: true })
})
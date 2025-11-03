import path from 'node:path'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

async function downloadToFile(url: string, dest: string) {
  const r = await fetch(url, { redirect: 'follow' })
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status} ${url}`)
  mkdirSync(path.dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(r.body as any), createWriteStream(dest))
}

async function ensureOnnx(filePath: string, urls: string[], minBytes = 1_000_000) {
  if (existsSync(filePath)) {
    const size = statSync(filePath).size
    if (size >= minBytes) return
    console.warn(`[face] ${path.basename(filePath)} muy pequeño (${size}), re-descargando`)
  }
  mkdirSync(path.dirname(filePath), { recursive: true })

  let lastErr: any
  for (const u of urls) {
    try {
      console.log('[face] descargando', u)
      await downloadToFile(u, filePath)
      const size = statSync(filePath).size
      if (size < minBytes) throw new Error(`archivo pequeño: ${size} bytes`)
      console.log('[face] guardado', filePath, `(${size} bytes)`)
      return
    } catch (e) {
      lastErr = e
      console.warn('[face] fallo', u, String(e))
    }
  }
  throw new Error(`No pude obtener ${path.basename(filePath)}. Último error: ${String(lastErr)}`)
}

export let FACE_READY = false
export let FACE_ERROR: string | null = null

const ready = (async () => {
  try {
    if (process.env.FACE_ENABLED === 'false') {
      FACE_ERROR = 'Face disabled by env'
      console.warn('[face] disabled by env')
      return
    }

    const modelsDir = process.env.MODELS_DIR || './onnx_models'
    const recPath = path.resolve(modelsDir, 'rec.onnx')
    const recUrls = [process.env.REC_ONNX_URL!].filter(Boolean)

    // descarga solo si falta o es demasiado pequeño
    await ensureOnnx(recPath, recUrls, /* minBytes */ 50_000_000)

    // (opcional) si vas a usar detector:
    if (process.env.DET_ONNX_URL) {
      const detPath = path.resolve(modelsDir, 'det.onnx') // usa el mismo nombre que en tu servicio
      const detUrls = [process.env.DET_ONNX_URL!]
      await ensureOnnx(detPath, detUrls, 10_000_000)
    }

    const { loadOnnx } = await import('#services/FaceOnnx')
    await loadOnnx(modelsDir) // <-- UNA sola vez
    FACE_READY = true
    console.log('[face] ONNX cargado')
  } catch (e: any) {
    FACE_ERROR = e?.message ?? String(e)
    console.error('[face] boot onnx error:', FACE_ERROR)
  }
})()

export default ready

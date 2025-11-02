import path from 'node:path'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

async function fetchBin(url: string) {
  const r = await fetch(url, { redirect: 'follow' })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`)
  return Buffer.from(await r.arrayBuffer())
}

async function ensureOnnx(filePath: string, urls: string[], minBytes = 1_000_000) {
  if (existsSync(filePath)) {
    try {
      const size = statSync(filePath).size
      if (size >= minBytes) return
      console.warn(`[face] ${path.basename(filePath)} muy pequeño (${size}), re-descargando`)
    } catch {}
  }
  mkdirSync(path.dirname(filePath), { recursive: true })
  let lastErr: any
  for (const u of urls) {
    try {
      console.log('[face] descargando', u)
      const buf = await fetchBin(u)
      if (buf.length < minBytes) throw new Error(`archivo pequeño: ${buf.length} bytes`)
      await writeFile(filePath, buf)
      console.log('[face] guardado', filePath, `(${buf.length} bytes)`)
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
    await ensureOnnx(recPath, [
      // RAW oficial
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/public/sface_2021dec/sface_2021dec.onnx',
      // espejo alterno (ghproxy)
      'https://mirror.ghproxy.com/https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/public/sface_2021dec/sface_2021dec.onnx',
    ], 1_000_000)

    const { loadOnnx } = await import('#services/FaceOnnx')
    await loadOnnx(modelsDir)
    await loadOnnx(process.env.MODELS_DIR || './onnx_models')
    FACE_READY = true
    console.log('[face] ONNX cargado')
  } catch (e: any) {
    FACE_ERROR = e?.message ?? String(e)
    console.error('[face] boot onnx error:', FACE_ERROR)
  }
})()
export default ready

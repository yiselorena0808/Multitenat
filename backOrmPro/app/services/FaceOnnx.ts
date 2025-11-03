import * as ort from 'onnxruntime-node'
import sharp from 'sharp'
import path from 'node:path'

export let recSession: ort.InferenceSession
export let det: ort.InferenceSession | null = null

// Cache interno: layout/tamaño detectados del modelo de reconocimiento
type Layout = 'NCHW' | 'NHWC'
let REC_LAYOUT: Layout = 'NCHW'
let REC_SIZE_H = 128
let REC_SIZE_W = 128

export async function loadOnnx(modelsDir = './onnx_models') {
   const recPath = path.join(modelsDir, 'rec.onnx')
  recSession = await ort.InferenceSession.create(recPath, { executionProviders: ['cpu'] })

  const { inName, meta } = pickInputMeta(recSession)
  const dims = meta.dimensions as ReadonlyArray<number | undefined>

  const isNCHW = dims[1] === 3 || (dims[1] == null && dims[3] !== 3)
  const Hexp = isNCHW ? dims[2] : dims[1]
  const Wexp = isNCHW ? dims[3] : dims[2]
  const isFiniteNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

  REC_LAYOUT = isNCHW ? 'NCHW' : 'NHWC'
  REC_SIZE_H = isFiniteNum(Hexp) ? Hexp : 128
  REC_SIZE_W = isFiniteNum(Wexp) ? Wexp : 128

  console.log('[FaceOnnx] Input name:', inName)
  console.log('[FaceOnnx] Layout:', REC_LAYOUT, 'Dims:', dims, 'Using size:', REC_SIZE_H, 'x', REC_SIZE_W)

  // (Opcional) detector
  const detPath = path.join(modelsDir, 'det.onnx')
  try {
    det = await ort.InferenceSession.create(detPath, { executionProviders: ['cpu'] })
  } catch {
    det = null
  }

  console.log('[FaceOnnx] Modelo ONNX cargado')
  console.log('[FaceOnnx] Layout:', REC_LAYOUT, 'Input:', [REC_SIZE_H, REC_SIZE_W])
}

// -------------------------------------------
// utils
function l2norm(v: Float32Array) {
  let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]
  const n = Math.sqrt(s) || 1
  for (let i = 0; i < v.length; i++) v[i] /= n
  return v
}

// Normalización: igual que tenías (a rango [-1, 1])
 function norm01_to_minus1_1(x: number) { return x / 127.5 - 1.0 }

// -------------------------------------------
// embedding dinámico en tamaño y layout
export async function computeEmbedding(buffer: Buffer): Promise<number[]> {
  const H = REC_SIZE_H
  const W = REC_SIZE_W

  // 1) RGB crudo del tamaño que el modelo espera
  const raw = await sharp(buffer)
    .resize(W, H, { fit: 'cover' })
    .removeAlpha()
    .toColorspace('rgb')
    .raw()
    .toBuffer()

  // 2) Normalizar a [-1, 1] como ya usabas
  const float = new Float32Array(raw.length)
  for (let i = 0; i < raw.length; i++) float[i] = norm01_to_minus1_1(raw[i])

  const inputName = recSession.inputNames[0]
  const feeds: Record<string, ort.Tensor> = {}

  if (REC_LAYOUT === 'NCHW') {
    // HWC -> CHW
    const pixels = H * W
    const chw = new Float32Array(3 * pixels)
    for (let i = 0; i < pixels; i++) {
      chw[i] = float[i * 3]
      chw[i + pixels] = float[i * 3 + 1]
      chw[i + 2 * pixels] = float[i * 3 + 2]
    }
    feeds[inputName] = new ort.Tensor('float32', chw, [1, 3, H, W])
  } else {
    // NHWC: ya está HWC → sólo darle shape [1,H,W,3]
    feeds[inputName] = new ort.Tensor('float32', float, [1, H, W, 3])
  }

  const out = await recSession.run(feeds)
  const outName = recSession.outputNames[0]
  const emb = out[outName].data as Float32Array
  return Array.from(l2norm(emb))
}

// -------------------------------------------
// matching (igual que tenías)
export function cosine (a: number[], b: number[]) {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s 
}

export function bestMatch(
  query: number[],
  labeled: Array<{label: string | number; descriptor: number[]}>,
  threshold = 0.4
) {
  if (!labeled.length) return { label: 'unknown', score: -1 }
  let best = { label: 'unknown', score: -1 }
  for (const x of labeled) {
    const score = cosine(query, x.descriptor)
    if (score > best.score) best = { label: String(x.label), score }
  }
  if (best.score < threshold) return { label: 'unknown', score: best.score }
  return best
}

function pickInputMeta(session: ort.InferenceSession) {
  const names = session.inputNames as string[]
   type TensorMetaLike = { dimensions?: ReadonlyArray<number | undefined> }
  const metaMap = session.inputMetadata as unknown as Record<string, TensorMetaLike>

  // intenta por nombre explícito
  let inName = names?.[0]
  let meta = inName ? metaMap[inName] : undefined

  // fallback: toma el primer entry del metadata si no hubo match por nombre
  if (!meta) {
    const entries = Object.entries(metaMap)
    if (entries.length === 0) throw new Error('Modelo sin inputMetadata')
    const [k, v] = entries[0]
    inName = k
    meta = v
  }

  if (!meta?.dimensions) {
    // logea para depurar rápido
    console.error('[ONNX] inputNames:', names)
    console.error('[ONNX] meta keys:', Object.keys(metaMap))
    throw new Error('No se pudieron leer las dimensiones del input del modelo')
  }

  return { inName: inName!, meta: meta! }
}
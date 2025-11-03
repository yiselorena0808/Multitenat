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
  type TensorMetaLike = { dimensions?: ReadonlyArray<number | undefined> }
  const recPath = path.join(modelsDir, 'rec.onnx')
  recSession = await ort.InferenceSession.create(recPath, { executionProviders: ['cpu'] })

  // Detectar layout y tamaño del input
  const inName = recSession.inputNames[0] as string
  const metaMap = recSession.inputMetadata as unknown as Record<string, TensorMetaLike>
  const meta = metaMap[inName]!
  const dims = (meta.dimensions ?? []) as ReadonlyArray<number | undefined> // ej: [1,3,128,128] o [1,128,128,3]

  REC_LAYOUT = dims[1] === 3 ? 'NCHW' : 'NHWC'
  // Si vienen dinámicos (-1), cae a 128
  if (REC_LAYOUT === 'NCHW') {
    REC_SIZE_H = Number.isFinite(Number(dims[2])) ? Number(dims[2]) : 128
    REC_SIZE_W = Number.isFinite(Number(dims[3])) ? Number(dims[3]) : 128
  } else {
    REC_SIZE_H = Number.isFinite(Number(dims[1])) ? Number(dims[1]) : 128
    REC_SIZE_W = Number.isFinite(Number(dims[2])) ? Number(dims[2]) : 128
  }

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

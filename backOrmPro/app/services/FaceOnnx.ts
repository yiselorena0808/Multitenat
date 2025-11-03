// app/services/face_onnx.ts
import * as ort from 'onnxruntime-node'
import sharp from 'sharp'
import path from 'node:path'

export let recSession: ort.InferenceSession
export let det: ort.InferenceSession | null = null

// Cache interno detectado
type Layout = 'NCHW' | 'NHWC'
let REC_LAYOUT: Layout = 'NCHW'
let REC_SIZE_H = 128
let REC_SIZE_W = 128

// ---------- Tipos/Utils internos ----------
type TensorMetaLike = { dimensions?: ReadonlyArray<number | undefined> }
const isFiniteNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const normalizeMinus1To1 = (x: number) => x / 127.5 - 1.0

function l2norm(v: Float32Array) {
  let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]
  const n = Math.sqrt(s) || 1
  for (let i = 0; i < v.length; i++) v[i] /= n
  return v
}

// Intenta obtener metadata por nombre; si no, por índice '0'
function getMeta(session: ort.InferenceSession) {
  const names = session.inputNames as string[]
  const metaMap = session.inputMetadata as unknown as Record<string, TensorMetaLike>
  let name = names?.[0]
  let meta = name ? metaMap[name] : undefined
  if (!meta) meta = metaMap['0']
  return { name: name ?? '0', meta, names, metaKeys: Object.keys(metaMap) }
}

async function tryRun(session: ort.InferenceSession, layout: Layout, size: number) {
  const inName = (session.inputNames[0] as string) ?? '0'
  const plane = size * size
  const zeros = new Float32Array(3 * plane) // vale para probe

  const tensor = layout === 'NCHW'
    ? new ort.Tensor('float32', zeros, [1, 3, size, size])
    : new ort.Tensor('float32', zeros, [1, size, size, 3])

  try {
    await session.run({ [inName]: tensor })
    return { ok: true }
  } catch (e: any) {
    const msg = String(e?.message ?? e)
    const isDimErr = /invalid dimensions|indices|shape|expected/i.test(msg)
    return { ok: false, msg, isDimErr }
  }
}

async function probeInputShape(session: ort.InferenceSession) {
  const sizes = [
    Number(process.env.FACE_INPUT_SIZE ?? '') || 128,
    112, 160, 224,
  ]
  const layouts: Layout[] = [
    (process.env.FACE_LAYOUT as any) === 'NHWC' ? 'NHWC' : 'NCHW',
    'NHWC', 'NCHW',
  ]

  for (const sz of sizes) {
    for (const ly of layouts) {
      const res = await tryRun(session, ly, sz)
      if (res.ok) {
        REC_LAYOUT = ly
        REC_SIZE_H = REC_SIZE_W = sz
        console.log('[FaceOnnx] Probe OK → layout:', ly, 'size:', sz)
        return
      } else if (!res.isDimErr) {
        console.warn('[FaceOnnx] Probe non-dimension error (continuando):', res.msg)
      }
    }
  }
  throw new Error('No se pudo determinar layout/tamaño del input por probe')
}

// ---------- API pública ----------
export async function loadOnnx(modelsDir = './onnx_models') {
  const recPath = path.join(modelsDir, 'rec.onnx')
  recSession = await ort.InferenceSession.create(recPath, { executionProviders: ['cpu'] })

  const { name, meta, names, metaKeys } = getMeta(recSession)
  console.info('[ONNX] inputNames:', names)
  console.info('[ONNX] meta keys:', metaKeys)

  if (meta?.dimensions && meta.dimensions.length >= 4) {
    const dims = meta.dimensions
    const isNCHW = dims[1] === 3 || (dims[1] == null && dims[3] !== 3)
    const Hexp = isNCHW ? dims[2] : dims[1]
    const Wexp = isNCHW ? dims[3] : dims[2]
    REC_LAYOUT = isNCHW ? 'NCHW' : 'NHWC'
    REC_SIZE_H = isFiniteNum(Hexp) ? Hexp : 128
    REC_SIZE_W = isFiniteNum(Wexp) ? Wexp : 128
    console.log('[FaceOnnx] Usando metadata → name:', name, 'layout:', REC_LAYOUT, 'dims:', dims)
  } else {
    console.warn('[FaceOnnx] Sin dimensions en metadata. Iniciando probe…')
    await probeInputShape(recSession)
  }

  // (Opcional) cargar detector
  const detPath = path.join(modelsDir, 'det.onnx')
  try {
    det = await ort.InferenceSession.create(detPath, { executionProviders: ['cpu'] })
  } catch {
    det = null
  }

  console.log('[FaceOnnx] Modelo ONNX cargado. Layout:', REC_LAYOUT, 'Input:', [REC_SIZE_H, REC_SIZE_W])
}

export async function computeEmbedding(buffer: Buffer): Promise<number[]> {
  const H = REC_SIZE_H, W = REC_SIZE_W

  // Preprocesado a tamaño detectado
  const raw = await sharp(buffer)
    .resize(W, H, { fit: 'cover' })
    .removeAlpha()
    .toColorspace('rgb')
    .raw()
    .toBuffer()

  // Normalización [-1, 1] (ajusta si tu modelo requiere otra)
  const float = new Float32Array(raw.length)
  for (let i = 0; i < raw.length; i++) float[i] = normalizeMinus1To1(raw[i])

  const inputName = (recSession.inputNames[0] as string) ?? '0'
  const feeds: Record<string, ort.Tensor> = {}

  if (REC_LAYOUT === 'NCHW') {
    const pixels = H * W
    const chw = new Float32Array(3 * pixels)
    for (let i = 0; i < pixels; i++) {
      chw[i] = float[i * 3]
      chw[i + pixels] = float[i * 3 + 1]
      chw[i + 2 * pixels] = float[i * 3 + 2]
    }
    feeds[inputName] = new ort.Tensor('float32', chw, [1, 3, H, W])
  } else {
    feeds[inputName] = new ort.Tensor('float32', float, [1, H, W, 3])
  }

  const out = await recSession.run(feeds)
  const outName = recSession.outputNames[0]
  const emb = out[outName].data as Float32Array
  return Array.from(l2norm(emb))
}

// Matching igual que tenías
export function cosine(a: number[], b: number[]) {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export function bestMatch(
  query: number[],
  labeled: Array<{ label: string | number; descriptor: number[] }>,
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

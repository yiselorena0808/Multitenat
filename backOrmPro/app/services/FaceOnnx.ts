import * as ort from 'onnxruntime-node'
import sharp from 'sharp'

let recSession: ort.InferenceSession

export async function loadOnnx(modelsDir = './onnx_models') {
    recSession = await ort.InferenceSession.create(`${modelsDir}/rec.onnx`, {
        executionProviders: ['cpu'],

    })
    console.log('[FaceOnnx] Modelo ONNX cargado')
}

function l2norm(v: Float32Array) {
    let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]
    const n = Math.sqrt(s) || 1
    for (let i = 0; i < v.length; i++) v[i] /= n
    return v
}

export async function computeEmbedding(buffer: Buffer): Promise<number[]> {
    const W = 112, H = 112
    const raw = await sharp(buffer).resize(W, H).removeAlpha().raw().toBuffer()
    const float = new Float32Array(raw.length)
    for (let i = 0; i < raw.length; i++) float[i] = raw[i] / 127.5 - 1.0
    const pixels = W * H
    const chw = new Float32Array(3 * pixels)
    for (let i = 0; i < pixels; i++) {
        chw[i] = float[i * 3 ]
        chw[i + pixels] = float[i * 3 + 1]
        chw[i + 2 * pixels] = float[i * 3 + 2]
    }

    const inputName = recSession.inputNames[0]
    const feeds: Record<string, ort.Tensor> = {}
    feeds[inputName] = new ort.Tensor('float32', chw, [1, 3, H, W])
    const out = await recSession.run(feeds)
    const outName = recSession.outputNames[0]
    const emb = out[outName].data as Float32Array
    return Array.from(l2norm(emb))
}

export function cosine (a: number[], b: number[]) {
    let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]
    return s 
}

export function bestMatch(query: number[], 
    labeled:Array<{label: string | number; descriptor: number[]}>,
    threshold = 0.4
) {
    if (!labeled.length) return {label: 'unknown', score: -1}
    let best = {label: 'unknown', score: -1}
    for (const x of labeled) {
        const score = cosine(query, x.descriptor)
        if (score > best.score) best = {label: String(x.label), score}
    }
    if (best.score < threshold) return {label: 'unknown', score: best.score}
    return best
}
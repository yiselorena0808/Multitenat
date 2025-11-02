export let FACE_READY = false
export let FACE_ERROR: string | null = null

const ready = (async () => {
  try {
    if (process.env.FACE_ENABLED === 'false') {
      FACE_ERROR = 'Face disabled by env'
      console.warn('[face] disabled by env')
      return
    }
    const { loadOnnx } = await import('#services/FaceOnnx')
    await loadOnnx(process.env.MODELS_DIR || './onnx_models')
    FACE_READY = true
    console.log('[face] ONNX cargado')
  } catch (e: any) {
    FACE_ERROR = e?.message ?? String(e)
    console.error('[face] boot onnx error:', FACE_ERROR)
  }
})()
export default ready

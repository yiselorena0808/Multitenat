export let FACE_READY = false
export let FACE_ERROR: string | null = null
export let FACE_BACKEND: string | null = null

const ready = (async () => {
  try {
    const { loadModels } = await import('#services/FaceUtils')
    await loadModels(process.env.MODELS_DIR || './models')
    FACE_READY = true
    FACE_BACKEND = 'tfjs-cpu'
    console.log('[face] modelos cargados')
  } catch (e: any) {
    FACE_ERROR = e?.message ?? String(e)
    console.error('[face] Error al cargar modelos:', FACE_ERROR)
  }
})()

export default ready

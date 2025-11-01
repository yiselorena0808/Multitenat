
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js'
import { Canvas, Image, ImageData} from 'skia-canvas'

(faceapi as any).env.monkeyPatch({Canvas, Image, ImageData})

export let FACE_READY = false
export let FACE_ERROR: string | null = null
export let FACE_BACKEND: string | null = null 


const ready = (async () => {
    try {
await import ('@tensorflow/tfjs')
const { loadModels } = await import ('../app/services/FaceUtils.js')
await loadModels(process.env.MODELS_DIR)
FACE_READY=true
 FACE_BACKEND = 'tfjs-js'  
 console.log('[face] Modelos cargados - tfjs (JS) + skia-canvas')
    } catch (err: any) {
        FACE_ERROR = err.message
        console.error('[face] Error al cargar modelos:', FACE_ERROR)
    }
}) ()




export default ready;
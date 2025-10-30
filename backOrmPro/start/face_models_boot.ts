
import * as faceapi from '@vladmandic/face-api'
import { Canvas, Image, ImageData} from 'skia-canvas'

faceapi.env.monkeyPatch({Canvas, Image, ImageData})

export let FACE_READY = false


const ready = (async () => {
await import ('@tensorflow/tfjs')
const { loadModels } = await import ('../app/services/FaceUtils.js')
await loadModels(process.env.MODELS_DIR)
FACE_READY=true
 console.log('[face] Modelos cargados - tfjs (JS) + skia-canvas')
}) ()

export default ready;
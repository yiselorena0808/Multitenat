import { loadModels } from "#services/FaceUtils";
import '@tensorflow/tfjs-node';


const ready = (async () => {
await loadModels(process.env.MODELS_DIR)
 console.log('[face] Modelos cargados')
}) ()

export default ready;
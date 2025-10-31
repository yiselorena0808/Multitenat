
const { Canvas, Image, ImageData }: any = require('canvas')
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js'


import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-converter'

faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

export async function loadModels(modelsDir = './models') {
  await tf.setBackend('cpu')        // fuerza backend JS/CPU
  await tf.ready()

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsDir)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsDir)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsDir)
  console.log('[face] backend=tfjs-cpu, modelos cargados de', modelsDir)
}

export async function computeDescriptor(buffer: Buffer): Promise<number[]> {
  const img = new Image()
  img.src = buffer
  const det = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!det) throw new Error('No se detectó rostro en la imagen')
  return Array.from(det.descriptor) // Float32Array -> number[]
}

export function bestMatch(
  queryDescriptor: number[],
  labeled: Array<{ label: string | number; descriptor: number[] }>,
  threshold = 0.6
): { label: string; distance: number } {
  if (labeled.length === 0) return { label: 'unknown', distance: 1 }

  const labeledDescs = labeled.map(
    (ld) => new faceapi.LabeledFaceDescriptors(
      String(ld.label),
      [new Float32Array(ld.descriptor)]
    )
  )

  const matcher = new faceapi.FaceMatcher(labeledDescs, threshold)
  const result = matcher.findBestMatch(new Float32Array(queryDescriptor))
  return { label: result.label, distance: result.distance }
}

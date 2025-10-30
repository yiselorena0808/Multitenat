
const { Canvas, Image, ImageData }: any = require('canvas')
import path from 'node:path'
import * as faceapi from '@vladmandic/face-api'

faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

export async function loadModels(modelsDir?: string): Promise<void> {
  const dir = modelsDir ?? path.join(process.cwd(), 'models')
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(dir)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(dir)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(dir)
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

import { v2 as cloudinary } from 'cloudinary'
import axios from 'axios'

const cloudName = process.env.CLOUD_NAME
const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export async function subirImg({ request, response }: { request: any, response: any }) {
  try {
    const image = request.file('imagen')
    if (!image) return response.badRequest({ error: 'No se envió imagen' })
    const uploaded = await cloudinary.uploader.upload(image.tmpPath!)
    return response.ok({ url: uploaded.secure_url })
  } catch (error) {
    return response.internalServerError({ error: error.message })
  }
}

export async function obtenerImagenes() {
  try {
    const res = await axios.get(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
      {
        auth: {
          username: apiKey || '',
          password: apiSecret || ''
        },
      }
    )
    return res.data.resources
  } catch (error) {
    return []
  }
}
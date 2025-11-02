import type { HttpContext } from "@adonisjs/core/http";
import Face from "../models/face.js";
import { computeEmbedding, bestMatch } from "#services/FaceOnnx";
import fs from 'fs/promises';

export default class FaceController {

  public async enroll({ auth, request, response}: HttpContext) {
    const user = auth.user
    if (!user) {
        return response.unauthorized({ message: 'Usuario no autenticado' });
    }

    const file = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    if (!file) return response.badRequest({ message: 'No se ha proporcionado ninguna imagen' });
    if (!file.isValid) return response.badRequest(file.errors);

    let buffer: Buffer
    if (typeof (file as any).toBuffer === 'function'){
        buffer = await (file as any).toBuffer()
    } else if (file.tmpPath) {
        buffer = await fs.readFile(file.tmpPath)
    } else {
        return response.badRequest({ message: 'No se pudo procesar la imagen' });
    }

   try {
       const descriptor = await computeEmbedding(buffer)

       const existing = await Face.query().where('id_usuario', user.id).first()
      if (existing) {
        existing.descriptor = descriptor
        await existing.save()
      } else {
        await Face.create({
          id_usuario: user.id,
          descriptor: descriptor
        })
      }

      return {message: 'Rostro registrado correctamente', id_usuario: user.id}
   } catch (e:any) {
      return response.badRequest({message: e?.message ?? 'Error al procesar la imagen'})
   }

  }

  public async verify({ request, response}: HttpContext) {
    const file = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    if (!file) return response.badRequest({ message: 'No se ha proporcionado ninguna imagen' });
    if (!file.isValid) return response.badRequest(file.errors);

    let buffer: Buffer
    if (typeof (file as any).toBuffer === 'function'){
        buffer = await (file as any).toBuffer()
    } else if (file.tmpPath){
        buffer = await fs.readFile(file.tmpPath)
    } else {
        return response.badRequest({ message: 'No se pudo procesar la imagen' });
    }

    try {
        const query = await computeEmbedding(buffer)
        const rows = await Face.all()
        const labeled = rows.map((r) => ({
            label: r.id_usuario,
            descriptor: r.descriptor,
        }))

        const {label, score} = bestMatch(query, labeled, 0.6)
        if (label === 'unknown') return {match: null, score}

        return { match: {id_usuario: Number(label)}, score }
    } catch (e:any) {
        return response.badRequest({message: e?.message ?? 'Error al procesar la imagen'})
    }
  }

  public async verifySelf({auth, request, response}: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized({ message: 'Usuario no autenticado' });

    const faceRow = await Face.query().where('id_usuario', user.id).first()
    if (!faceRow) return response.badRequest({ message: 'El usuario no tiene un rostro registrado' });

    const file = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    if (!file) return response.badRequest({ message: 'No se ha proporcionado ninguna imagen' });
    if (!file.isValid) return response.badRequest(file.errors);
    
    let buffer: Buffer
    if (typeof (file as any).toBuffer === 'function') buffer = await (file as any).toBuffer()
    else if (file.tmpPath) buffer = await fs.readFile(file.tmpPath)
    else return response.badRequest({ message: 'No se pudo procesar la imagen' });

    try {
        const query = await computeEmbedding(buffer)
        const {label, score} = bestMatch(
            query,
            [{ label: user.id, descriptor: faceRow.descriptor }],
            0.6
        )
        if (label === 'unknown') return { match: false, score }
        return { match: true, score }
    } catch (e:any) {
        return response.badRequest({message: e?.message ?? 'Error al procesar la imagen'})      
    }
  }

}
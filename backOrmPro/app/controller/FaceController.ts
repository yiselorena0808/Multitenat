import type { HttpContext } from "@adonisjs/core/http";
import Face from "../models/face.js";
import { computeEmbedding, bestMatch } from "#services/FaceOnnx";
import fs from 'fs/promises';

export default class FaceController {
    
public async enroll({ request, response }: HttpContext) {
  const idUsuario = Number(request.input('id_usuario'))
  if (!idUsuario) return response.badRequest({ message: 'Falta id_usuario' })

  const file = request.file('image', { size:'5mb', extnames:['jpg','jpeg','png','webp'] })
  if (!file) return response.badRequest({ message:'Falta image' })
  if (!file.isValid) return response.badRequest(file.errors)

  const buffer = typeof (file as any).toBuffer === 'function'
    ? await (file as any).toBuffer()
    : await fs.readFile(file.tmpPath!)

  const descriptor = await computeEmbedding(buffer)

  await Face.updateOrCreate(
    { id_usuario: idUsuario },
    { id_usuario: idUsuario, descriptor }
  )

  return { ok: true, id_usuario: idUsuario, len: descriptor.length }
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
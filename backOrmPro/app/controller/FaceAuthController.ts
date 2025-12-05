import type { HttpContext } from '@adonisjs/core/http'
// Use process.env instead of Adonis Env to avoid missing module errors
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import Usuario from '#models/usuario'

export default class FaceAuthController {
  public async register({ request, response }: HttpContext) {
    try {
        console.log('📥 Recibiendo solicitud de registro facial...');
        
        const userId = request.input('user_id');
        console.log('👤 User ID recibido:', userId);

        const file = request.file('file', {
            size: '5mb',
            extnames: ['jpg', 'jpeg', 'png'],
        });

        if (!file || !file.tmpPath) {
            console.log('❌ No se recibió archivo');
            return response.badRequest('Falta la imagen');
        }

        console.log('📁 Archivo recibido:', file.clientName, file.size);

        // Leer el archivo y convertirlo a base64
        const fileBuffer = fs.readFileSync(file.tmpPath);
        const base64Image = fileBuffer.toString('base64');
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

        const apiUrl = process.env.FACE_API_URL ?? 'https://facialsst-production.up.railway.app';
        const faceRegisterUrl = `${apiUrl}/face/register`;
        console.log('🔗 Conectando con:', faceRegisterUrl);

        // ENVIAR COMO FORMDATA, NO COMO JSON
        const formData = new FormData();
        formData.append('id_usuario', userId.toString()); // Cambiar a id_usuario
        formData.append('image', imageDataUrl);           // Cambiar a image

        console.log('📤 Enviando como FormData...');

        const { data } = await axios.post(faceRegisterUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('✅ Respuesta del servicio Face ID:', data);

        return response.ok({
            message: 'Rostro registrado correctamente',
            data,
        });
    } catch (error) {
        console.error('❌ Error completo en register:', error);
        console.error('📊 Error response:', error.response?.data);
        return response.internalServerError('Error registrando rostro: ' + error.message);
    }
}

public async login({ request, response }: HttpContext) {
    try {
        const file = request.file('file', {
            size: '5mb',
            extnames: ['jpg', 'jpeg', 'png'],
        });

        if (!file || !file.tmpPath) {
            return response.badRequest('Falta la imagen');
        }

        const apiUrl = process.env.FACE_API_URL ?? 'https://facialsst-production.up.railway.app';
        const faceLoginUrl = `${apiUrl}/face/login`;

        // ENVIAR EL ARCHIVO BINARIO DIRECTAMENTE (igual que en register)
        const formData = new FormData();
        formData.append('image', fs.createReadStream(file.tmpPath)); // Archivo binario

        const { data } = await axios.post(faceLoginUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('🔑 Respuesta del servicio facial:', data);

        if (!data.authenticated) {
            return response.unauthorized('Rostro no reconocido');
        }

        // Buscar usuario por ID que devolvió el microservicio
        const userId = data.id_usuario || data.user_id;
        console.log('👤 Buscando usuario ID:', userId);
        
        const user = await Usuario.find(userId);
        if (!user) {
            console.log('❌ Usuario no encontrado con ID:', userId);
            return response.unauthorized('Usuario no encontrado');
        }

        const accessToken = await Usuario.accessTokens.create(user);
        const token = accessToken.value!.release();

        return {
            token,
            type: 'bearer',
            user,
        };
    } catch (error) {
        console.error('❌ Error completo en login:', error);
        return response.internalServerError('Error en login con rostro');
 }
}


}

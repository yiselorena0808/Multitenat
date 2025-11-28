import type { HttpContext } from "@adonisjs/core/http";
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'



export default class FaceController {
    

   public async registroCara({ request, response }: HttpContext) {
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

        const apiUrl = process.env.FACE_API_URL ?? 'http://127.0.0.1:8000';
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



}
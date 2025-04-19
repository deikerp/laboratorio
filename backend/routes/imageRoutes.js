// Agregar a uploadRoutes.js o crear un nuevo archivo routes/imageRoutes.js

import express from 'express';
import { FileService } from '../services/fileService.js';

const router = express.Router();

// Ruta para servir imágenes desencriptadas
router.get('/profile-image/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        
        if (!fileName) {
            return res.status(400).send('Nombre de archivo requerido');
        }

        // Obtener archivo desencriptado
        const fileBuffer = await FileService.getDecryptedFile(fileName);
        
        // Determinar tipo de contenido basado en la extensión
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        };
        
        // Establecer tipo de contenido por defecto o específico
        const contentType = mimeTypes[fileExtension] || 'image/jpeg';
        
        // Configurar encabezados y enviar imagen
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', fileBuffer.length);
        res.send(fileBuffer);
    } catch (error) {
        console.error('Error al servir imagen:', error);
        res.status(404).send('Imagen no encontrada');
    }
});

export default router;
import express from 'express';
import { FileService } from '../services/fileService.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

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

// Endpoint para eliminar imagen de la carpeta uploads
router.delete('/profile-image/:fileName', authenticateUser, async (req, res) => {
    try {
        const { fileName } = req.params;
        
        if (!fileName) {
            return res.status(400).json({ error: "El nombre del archivo es obligatorio" });
        }

        // Eliminar el archivo usando FileService
        const result = await FileService.deleteFile(fileName);
        
        res.status(200).json({ 
            success: true, 
            message: "Imagen eliminada exitosamente" 
        });
    } catch (error) {
        console.error('Error al eliminar imagen:', error.message);
        
        if (error.message === "Archivo no encontrado") {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }
        
        res.status(500).json({ error: "Error al eliminar la imagen" });
    }
});

export default router;
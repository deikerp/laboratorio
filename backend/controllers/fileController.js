import { FileService } from "../services/fileService.js";

// Controlador para subir archivo encriptado
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se ha seleccionado ningún archivo" });
        }

        const fileInfo = await FileService.saveEncryptedFile(
            req.file.buffer,
            req.file.originalname
        );

        res.status(201).json({
            message: "Archivo subido y encriptado con éxito",
            file: {
                originalName: fileInfo.originalName,
                fileName: fileInfo.fileName,
                fileSize: fileInfo.fileSize,
                uploadDate: fileInfo.uploadDate
            }
        });
    } catch (error) {
        console.log("Error al subir archivo:", error.message);
        res.status(500).json({ error: "Error al subir el archivo" });
    }
};

// Controlador para descargar archivo desencriptado
export const downloadFile = async (req, res) => {
    try {
        const { fileName } = req.params;
        
        if (!fileName) {
            return res.status(400).json({ error: "El nombre del archivo es obligatorio" });
        }

        const fileBuffer = await FileService.getDecryptedFile(fileName);
        
        // Determinar el tipo de contenido basado en la extensión del archivo
        const fileExtension = fileName.split('.').pop().toLowerCase();
        let contentType = 'application/octet-stream'; // Por defecto
        
        // Mapear extensiones comunes a tipos MIME
        const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt': 'text/plain',
            'csv': 'text/csv'
        };
        
        if (mimeTypes[fileExtension]) {
            contentType = mimeTypes[fileExtension];
        }
        
        // Extraer el nombre original si está codificado en el nombre del archivo
        const originalName = fileName.substring(fileName.indexOf('-') + 1);
        
        // Configurar encabezados de respuesta
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        // Enviar el archivo
        res.send(fileBuffer);
    } catch (error) {
        console.log("Error al descargar archivo:", error.message);
        
        if (error.message === "Archivo no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al descargar el archivo" });
    }
};

// Controlador para eliminar archivo
export const deleteFile = async (req, res) => {
    try {
        const { fileName } = req.params;
        
        if (!fileName) {
            return res.status(400).json({ error: "El nombre del archivo es obligatorio" });
        }

        const result = await FileService.deleteFile(fileName);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar archivo:", error.message);
        
        if (error.message === "Archivo no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar el archivo" });
    }
};
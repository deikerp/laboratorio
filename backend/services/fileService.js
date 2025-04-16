import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clave de encriptación
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lab_encryption_key_2025';
// El IV debe ser 16 bytes (128 bits)
const IV_LENGTH = 16;

// Dirección de uploads
const UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || path.join(__dirname, '../../uploads');

// Asegurar que el directorio existe
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

export class FileService {
    // Guardar archivo con encriptación
    static async saveEncryptedFile(fileBuffer, originalName) {
        try {
            // Generar nombre único para el archivo
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 12);
            const fileExtension = path.extname(originalName);
            const fileName = `${timestamp}-${randomStr}${fileExtension}`;
            const filePath = path.join(UPLOAD_PATH, fileName);
            
            // Encriptar el archivo
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            
            // Crear la encriptación
            const encryptedBuffer = Buffer.concat([
                iv,
                cipher.update(fileBuffer),
                cipher.final()
            ]);
            
            // Guardar el archivo encriptado
            fs.writeFileSync(filePath, encryptedBuffer);
            
            return {
                originalName,
                fileName,
                filePath,
                fileSize: fileBuffer.length,
                uploadDate: new Date()
            };
        } catch (error) {
            console.error('Error al guardar archivo encriptado:', error);
            throw new Error('Error al guardar el archivo');
        }
    }

    // Recuperar archivo desencriptado
    static async getDecryptedFile(fileName) {
        try {
            const filePath = path.join(UPLOAD_PATH, fileName);
            
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo no encontrado');
            }
            
            // Leer el archivo encriptado
            const encryptedBuffer = fs.readFileSync(filePath);
            
            // Extraer el IV del inicio del archivo
            const iv = encryptedBuffer.slice(0, IV_LENGTH);
            const encryptedData = encryptedBuffer.slice(IV_LENGTH);
            
            // Crear el descifrador
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            
            // Desencriptar el archivo
            const decryptedBuffer = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);
            
            return decryptedBuffer;
        } catch (error) {
            console.error('Error al recuperar archivo desencriptado:', error);
            throw new Error('Error al recuperar el archivo');
        }
    }

    // Eliminar archivo
    static async deleteFile(fileName) {
        try {
            const filePath = path.join(UPLOAD_PATH, fileName);
            
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo no encontrado');
            }
            
            // Eliminar el archivo
            fs.unlinkSync(filePath);
            
            return { success: true, message: 'Archivo eliminado exitosamente' };
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            throw new Error('Error al eliminar el archivo');
        }
    }
}
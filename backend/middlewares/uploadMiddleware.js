import multer from "multer";

// Configuración de Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

// Filtro para archivos permitidos
const fileFilter = (req, file, cb) => {
    // Lista de tipos MIME permitidos
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedMimeTypes.join(', ')}`), false);
    }
};

// Límites para los archivos
const limits = {
    fileSize: 10 * 1024 * 1024, // 10 MB máximo
};

// Middleware para subir un solo archivo
export const uploadSingleFile = multer({
    storage,
    fileFilter,
    limits
}).single('file');

// Middleware para manejo de errores de Multer
export const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Error de Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: "El archivo es demasiado grande. Tamaño máximo: 10MB" 
            });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // Otro tipo de error
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Middleware para subir archivos de imagen de perfil
export const uploadProfileImage = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'), false);
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB máximo
    }
}).single('imagen');
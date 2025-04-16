import express from 'express';
import { 
    uploadFile, 
    downloadFile, 
    deleteFile 
} from '../controllers/fileController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { uploadSingleFile, handleUploadErrors } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rutas para manejo de archivos
router.post('/', 
    authenticateUser, 
    uploadSingleFile, 
    handleUploadErrors, 
    uploadFile
);

router.get('/:fileName', authenticateUser, downloadFile);
router.delete('/:fileName', authenticateUser, deleteFile);

export default router;
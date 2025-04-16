import express from 'express';
import { 
    createUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser,
    getUserTypes,
    createFirstAdmin,
    changePassword // Importamos el nuevo controlador
    // Importa el nuevo controlador
} from '../controllers/userController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';
import { uploadProfileImage, handleUploadErrors } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rutas de usuario protegidas por autenticación y autorización
router.get('/', authenticateUser, getAllUsers);
router.get('/types', authenticateUser, getUserTypes);
router.get('/:id', authenticateUser, getUserById);

// Rutas para crear y actualizar requieren subida de imagen
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe'), 
    uploadProfileImage, 
    handleUploadErrors, 
    createUser
);

router.post('/first-admin', createFirstAdmin);

// Nueva ruta para cambiar contraseña
router.post('/:id/change-password', 
    authenticateUser,
    changePassword
);


router.put('/:id', 
    authenticateUser, 
    uploadProfileImage, 
    handleUploadErrors, 
    updateUser
);

router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe'), 
    deleteUser
);

export default router;
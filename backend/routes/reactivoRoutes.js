import express from 'express';
import { 
    getAllReactivos,
    getReactivoById,
    createReactivo,
    updateReactivo,
    deleteReactivo
} from '../controllers/reactivoController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para reactivos
router.get('/', authenticateUser, getAllReactivos);
router.get('/:id', authenticateUser, getReactivoById);
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createReactivo
);
router.put('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateReactivo
);
router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteReactivo
);

export default router;
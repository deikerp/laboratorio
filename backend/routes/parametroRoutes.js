import express from 'express';
import { 
    getAllParametros,
    getParametrosByAnalisisId,
    getParametroById,
    createParametro,
    updateParametro,
    deleteParametro
} from '../controllers/parametroController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para parámetros
router.get('/', authenticateUser, getAllParametros);
router.get('/analisis/:id_analisis', authenticateUser, getParametrosByAnalisisId);
router.get('/:id', authenticateUser, getParametroById);
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createParametro
);
router.put('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateParametro
);
router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteParametro
);

export default router;
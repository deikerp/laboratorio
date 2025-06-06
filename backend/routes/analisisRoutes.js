import express from 'express';
import { 
    getAllAnalisis,
    getAnalisisById,
    createAnalisis,
    updateAnalisis,
    deleteAnalisis,
} from '../controllers/analisisController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para análisis
router.get('/', authenticateUser, getAllAnalisis);
router.get('/:id', authenticateUser, getAnalisisById);
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createAnalisis
);
router.put('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateAnalisis
);
router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteAnalisis
);

export default router;
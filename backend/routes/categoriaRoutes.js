import express from 'express';
import { 
    getAllCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../controllers/categoriaController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para categorías
router.get('/', authenticateUser, getAllCategorias);
router.get('/:id', authenticateUser, getCategoriaById);
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createCategoria
);
router.put('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateCategoria
);
router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteCategoria
);

export default router;
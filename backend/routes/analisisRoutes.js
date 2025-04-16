import express from 'express';
import { 
    getAllCategorias,
    createCategoria,
    getAllAnalisis,
    getAnalisisById,
    createAnalisis,
    updateAnalisis,
    deleteAnalisis,
    getAllReactivos,
    createReactivo,
    getParametrosByAnalisisId,
    createParametro,
    updateParametro,
    deleteParametro
} from '../controllers/analisisController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para categorías
router.get('/categorias', authenticateUser, getAllCategorias);
router.post('/categorias', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createCategoria
);

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

// Rutas para reactivos
router.get('/reactivos/all', authenticateUser, getAllReactivos);
router.post('/reactivos', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createReactivo
);

// Rutas para parámetros
router.get('/parametros/:id_analisis', authenticateUser, getParametrosByAnalisisId);
router.post('/parametros', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createParametro
);
router.put('/parametros/:id_parametro', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateParametro
);
router.delete('/parametros/:id_parametro', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteParametro
);

export default router;
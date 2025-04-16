import express from 'express';
import { 
    createResultado, 
    getAllResultados,
    getResultadosByPaciente,
    getResultadosByAnalisis,
    getResultadoById,
    updateResultado,
    deleteResultado
} from '../controllers/resultadoController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de resultados protegidas por autenticación
router.get('/', authenticateUser, getAllResultados);
router.get('/paciente/:id_paciente', authenticateUser, getResultadosByPaciente);
router.get('/analisis/:id_analisis', authenticateUser, getResultadosByAnalisis);
router.get('/:id', authenticateUser, getResultadoById);
router.post('/', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    createResultado
);
router.put('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    updateResultado
);
router.delete('/:id', 
    authenticateUser, 
    authorizeRoles('Jefe', 'Bioanalista'), 
    deleteResultado
);

export default router;
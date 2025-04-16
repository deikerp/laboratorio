import express from 'express';
import { 
    createPaciente, 
    getAllPacientes, 
    getPacienteById, 
    searchPacientes,
    updatePaciente, 
    deletePaciente 
} from '../controllers/pacienteController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de pacientes protegidas por autenticación
router.get('/', authenticateUser, getAllPacientes);
router.get('/search', authenticateUser, searchPacientes);
router.get('/:id', authenticateUser, getPacienteById);
router.post('/', authenticateUser, createPaciente);
router.put('/:id', authenticateUser, updatePaciente);
router.delete('/:id', authenticateUser, deletePaciente);

export default router;
import express from 'express';
import { 
    getAllEstados,
    getAllMunicipios,
    getMunicipiosByEstado
} from '../controllers/ubicacionController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para ubicación (estados y municipios)
router.get('/estados', authenticateUser, getAllEstados);
router.get('/municipios', authenticateUser, getAllMunicipios);
router.get('/municipios/estado/:id_estado', authenticateUser, getMunicipiosByEstado);

export default router;
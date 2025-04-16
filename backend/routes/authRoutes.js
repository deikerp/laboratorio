import express from 'express';
import { loginUser, logoutUser, checkAuthStatus } from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de autenticación
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check', authenticateUser, checkAuthStatus);

export default router;
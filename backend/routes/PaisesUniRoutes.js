import express from "express";
import {
  getAllPaisesController,
  getUniversidadesByPaisController,
} from "../controllers/paisyuniController.js";

const router = express.Router();

// Endpoint GET /api/paises
router.get("/", getAllPaisesController); 

// Endpoint GET /api/paises/universidades/:idPais
router.get("/universidades/:idPais", getUniversidadesByPaisController);

export default router; // <- Exportación correcta
// src/controllers/perfilController.js
import * as perfilService from "../services/perfilService.js";

export const createPerfil = async (req, res) => {
    try {
      const perfil = await perfilService.createPerfil(req.body);
      res.status(201).json({ message: "Perfil creado con éxito", perfil });
    } catch (error) {
      const statusCode = error.message.includes('no existe') ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  };
  
  export const updatePerfil = async (req, res) => {
    try {
      const { id } = req.params;
      const perfil = await perfilService.updatePerfil({ id, ...req.body });
      res.status(200).json({ message: "Perfil actualizado con éxito", perfil });
    } catch (error) {
      const statusCode = error.message.includes('no existe') || error.message.includes('no encontrado') ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  };

// Controlador para obtener todos los perfiles
export const getAllPerfiles = async (req, res) => {
  try {
    const perfiles = await perfilService.getAllPerfiles();
    res.status(200).json(perfiles);
  } catch (error) {
    console.error("Error al obtener perfiles:", error.message); // Debug
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar un perfil
export const deletePerfil = async (req, res) => {
  try {
    const { id } = req.params;
    await perfilService.deletePerfil(id);
    res.status(200).json({ message: "Perfil eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar perfil:", error.message); // Debug
    res.status(500).json({ error: error.message });
  }
};

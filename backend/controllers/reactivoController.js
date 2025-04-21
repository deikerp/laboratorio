import { ReactivoService } from "../services/reactivoService.js";

// Controlador para obtener todos los reactivos
export const getAllReactivos = async (req, res) => {
    try {
        const reactivos = await ReactivoService.getAllReactivos();
        res.status(200).json(reactivos);
    } catch (error) {
        console.log("Error al obtener reactivos:", error.message);
        res.status(500).json({ error: "Error al obtener reactivos" });
    }
};

// Controlador para obtener un reactivo por ID
export const getReactivoById = async (req, res) => {
    try {
        const { id } = req.params;
        const reactivo = await ReactivoService.getReactivoById(id);
        res.status(200).json(reactivo);
    } catch (error) {
        console.log("Error al obtener reactivo:", error.message);
        
        if (error.message === "Reactivo no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener el reactivo" });
    }
};

// Controlador para crear reactivo
export const createReactivo = async (req, res) => {
    try {
        const { nombre_reactivo } = req.body;

        if (!nombre_reactivo) {
            return res.status(400).json({ error: "El nombre del reactivo es obligatorio" });
        }

        const newReactivo = await ReactivoService.createReactivo(nombre_reactivo);
        res.status(201).json({
            message: "Reactivo creado con éxito",
            reactivo: newReactivo
        });
    } catch (error) {
        console.log("Error al crear reactivo:", error.message);
        res.status(500).json({ error: "Error al crear reactivo" });
    }
};

// Controlador para actualizar reactivo
export const updateReactivo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_reactivo } = req.body;

        if (!nombre_reactivo) {
            return res.status(400).json({ error: "El nombre del reactivo es obligatorio" });
        }

        const updatedReactivo = await ReactivoService.updateReactivo(id, nombre_reactivo);
        res.status(200).json({
            message: "Reactivo actualizado con éxito",
            reactivo: updatedReactivo
        });
    } catch (error) {
        console.log("Error al actualizar reactivo:", error.message);
        
        if (error.message === "Reactivo no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar reactivo" });
    }
};

// Controlador para eliminar reactivo
export const deleteReactivo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReactivoService.deleteReactivo(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar reactivo:", error.message);
        
        if (error.message === "Reactivo no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message.includes("tiene parámetros asociados")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar reactivo" });
    }
};
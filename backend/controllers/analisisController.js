import { AnalisisService } from "../services/analisisService.js";

// Controlador para obtener todos los análisis
export const getAllAnalisis = async (req, res) => {
    try {
        const analisis = await AnalisisService.getAllAnalisis();
        res.status(200).json(analisis);
    } catch (error) {
        console.log("Error al obtener análisis:", error.message);
        res.status(500).json({ error: "Error al obtener análisis" });
    }
};

// Controlador para obtener un análisis por ID
export const getAnalisisById = async (req, res) => {
    try {
        const { id } = req.params;
        const analisis = await AnalisisService.getAnalisisById(id);
        res.status(200).json(analisis);
    } catch (error) {
        console.log("Error al obtener análisis:", error.message);
        
        if (error.message === "Análisis no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener el análisis" });
    }
};

// Controlador para crear análisis
export const createAnalisis = async (req, res) => {
    try {
        const { nombre, id_categoria } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre del análisis es obligatorio" });
        }

        const newAnalisis = await AnalisisService.createAnalisis(nombre, id_categoria);
        res.status(201).json({
            message: "Análisis creado con éxito",
            analisis: newAnalisis
        });
    } catch (error) {
        console.log("Error al crear análisis:", error.message);
        res.status(500).json({ error: "Error al crear análisis" });
    }
};

// Controlador para actualizar análisis
export const updateAnalisis = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, id_categoria } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre del análisis es obligatorio" });
        }

        const updatedAnalisis = await AnalisisService.updateAnalisis(id, nombre, id_categoria);
        res.status(200).json({
            message: "Análisis actualizado con éxito",
            analisis: updatedAnalisis
        });
    } catch (error) {
        console.log("Error al actualizar análisis:", error.message);
        
        if (error.message === "Análisis no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar análisis" });
    }
};

// Controlador para eliminar análisis
export const deleteAnalisis = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AnalisisService.deleteAnalisis(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar análisis:", error.message);
        
        if (error.message === "Análisis no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message.includes("tiene parámetros asociados") || 
            error.message.includes("tiene resultados asociados")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar análisis" });
    }
};


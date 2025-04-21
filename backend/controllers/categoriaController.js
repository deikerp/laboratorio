import { CategoriaService } from "../services/categoriaService.js";

// Controlador para obtener todas las categorías
export const getAllCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaService.getAllCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.log("Error al obtener categorías:", error.message);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};

// Controlador para obtener una categoría por ID
export const getCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await CategoriaService.getCategoriaById(id);
        res.status(200).json(categoria);
    } catch (error) {
        console.log("Error al obtener categoría:", error.message);
        
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener la categoría" });
    }
};

// Controlador para crear categoría
export const createCategoria = async (req, res) => {
    try {
        const { categoria } = req.body;

        if (!categoria) {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
        }

        const newCategoria = await CategoriaService.createCategoria(categoria);
        res.status(201).json({
            message: "Categoría creada con éxito",
            categoria: newCategoria
        });
    } catch (error) {
        console.log("Error al crear categoría:", error.message);
        res.status(500).json({ error: "Error al crear categoría" });
    }
};

// Controlador para actualizar categoría
export const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria } = req.body;

        if (!categoria) {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
        }

        const updatedCategoria = await CategoriaService.updateCategoria(id, categoria);
        res.status(200).json({
            message: "Categoría actualizada con éxito",
            categoria: updatedCategoria
        });
    } catch (error) {
        console.log("Error al actualizar categoría:", error.message);
        
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar categoría" });
    }
};

// Controlador para eliminar categoría
export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CategoriaService.deleteCategoria(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar categoría:", error.message);
        
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message.includes("tiene análisis asociados")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
};
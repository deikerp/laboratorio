import { AnalisisService } from "../services/analisisService.js";

// CATEGORÍAS DE ANÁLISIS

// Controlador para obtener todas las categorías
export const getAllCategorias = async (req, res) => {
    try {
        const categorias = await AnalisisService.getAllCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.log("Error al obtener categorías:", error.message);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};

// Controlador para crear categoría
export const createCategoria = async (req, res) => {
    try {
        const { categoria } = req.body;

        if (!categoria) {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
        }

        const newCategoria = await AnalisisService.createCategoria(categoria);
        res.status(201).json({
            message: "Categoría creada con éxito",
            categoria: newCategoria
        });
    } catch (error) {
        console.log("Error al crear categoría:", error.message);
        res.status(500).json({ error: "Error al crear categoría" });
    }
};

// ANÁLISIS

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

// REACTIVOS

// Controlador para obtener todos los reactivos
export const getAllReactivos = async (req, res) => {
    try {
        const reactivos = await AnalisisService.getAllReactivos();
        res.status(200).json(reactivos);
    } catch (error) {
        console.log("Error al obtener reactivos:", error.message);
        res.status(500).json({ error: "Error al obtener reactivos" });
    }
};

// Controlador para crear reactivo
export const createReactivo = async (req, res) => {
    try {
        const { nombre_reactivo } = req.body;

        if (!nombre_reactivo) {
            return res.status(400).json({ error: "El nombre del reactivo es obligatorio" });
        }

        const newReactivo = await AnalisisService.createReactivo(nombre_reactivo);
        res.status(201).json({
            message: "Reactivo creado con éxito",
            reactivo: newReactivo
        });
    } catch (error) {
        console.log("Error al crear reactivo:", error.message);
        res.status(500).json({ error: "Error al crear reactivo" });
    }
};

// PARÁMETROS

// Controlador para obtener parámetros por análisis
export const getParametrosByAnalisisId = async (req, res) => {
    try {
        const { id_analisis } = req.params;
        const parametros = await AnalisisService.getParametrosByAnalisisId(id_analisis);
        res.status(200).json(parametros);
    } catch (error) {
        console.log("Error al obtener parámetros:", error.message);
        res.status(500).json({ error: "Error al obtener parámetros" });
    }
};

// Controlador para crear parámetro
export const createParametro = async (req, res) => {
    try {
        const { id_analisis, nombre_parametro, valor_referencial, id_reactivo } = req.body;

        if (!id_analisis || !nombre_parametro) {
            return res.status(400).json({ 
                error: "El ID del análisis y el nombre del parámetro son obligatorios" 
            });
        }

        const newParametro = await AnalisisService.createParametro(
            id_analisis, 
            nombre_parametro, 
            valor_referencial, 
            id_reactivo
        );
        
        res.status(201).json({
            message: "Parámetro creado con éxito",
            parametro: newParametro
        });
    } catch (error) {
        console.log("Error al crear parámetro:", error.message);
        res.status(500).json({ error: "Error al crear parámetro" });
    }
};

// Controlador para actualizar parámetro
export const updateParametro = async (req, res) => {
    try {
        const { id_parametro } = req.params;
        const { nombre_parametro, valor_referencial, id_reactivo } = req.body;

        if (!nombre_parametro) {
            return res.status(400).json({ error: "El nombre del parámetro es obligatorio" });
        }

        const updatedParametro = await AnalisisService.updateParametro(
            id_parametro,
            nombre_parametro,
            valor_referencial,
            id_reactivo
        );
        
        res.status(200).json({
            message: "Parámetro actualizado con éxito",
            parametro: updatedParametro
        });
    } catch (error) {
        console.log("Error al actualizar parámetro:", error.message);
        
        if (error.message === "Parámetro no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar parámetro" });
    }
};

// Controlador para eliminar parámetro
export const deleteParametro = async (req, res) => {
    try {
        const { id_parametro } = req.params;
        const result = await AnalisisService.deleteParametro(id_parametro);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar parámetro:", error.message);
        
        if (error.message === "Parámetro no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message.includes("tiene resultados asociados")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar parámetro" });
    }
};
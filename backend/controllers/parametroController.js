import { ParametroService } from "../services/parametroService.js";

// Controlador para obtener todos los parámetros
export const getAllParametros = async (req, res) => {
    try {
        const parametros = await ParametroService.getAllParametros();
        res.status(200).json(parametros);
    } catch (error) {
        console.log("Error al obtener parámetros:", error.message);
        res.status(500).json({ error: "Error al obtener parámetros" });
    }
};

// Controlador para obtener parámetros por análisis
export const getParametrosByAnalisisId = async (req, res) => {
    try {
        const { id_analisis } = req.params;
        const parametros = await ParametroService.getParametrosByAnalisisId(id_analisis);
        res.status(200).json(parametros);
    } catch (error) {
        console.log("Error al obtener parámetros:", error.message);
        res.status(500).json({ error: "Error al obtener parámetros" });
    }
};

// Controlador para obtener un parámetro por ID
export const getParametroById = async (req, res) => {
    try {
        const { id } = req.params;
        const parametro = await ParametroService.getParametroById(id);
        res.status(200).json(parametro);
    } catch (error) {
        console.log("Error al obtener parámetro:", error.message);
        
        if (error.message === "Parámetro no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener el parámetro" });
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

        const newParametro = await ParametroService.createParametro(
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
        const { id } = req.params;
        const { nombre_parametro, valor_referencial, id_reactivo } = req.body;

        if (!nombre_parametro) {
            return res.status(400).json({ error: "El nombre del parámetro es obligatorio" });
        }

        const updatedParametro = await ParametroService.updateParametro(
            id,
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
        const { id } = req.params;
        const result = await ParametroService.deleteParametro(id);
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
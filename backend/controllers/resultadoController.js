import { ResultadoService } from "../services/resultadoService.js";

// Controlador para crear resultado
export const createResultado = async (req, res) => {
    try {
        const { 
            id_paciente, 
            id_analisis, 
            id_parametro, 
            valor_referencial, 
            resultado_parametro, 
            fecha 
        } = req.body;

        // Validaciones
        if (!id_paciente || !id_analisis || !id_parametro || !resultado_parametro) {
            return res.status(400).json({ 
                error: "Todos los campos marcados son obligatorios" 
            });
        }

        const resultadoData = {
            id_paciente,
            id_analisis,
            id_parametro,
            valor_referencial,
            resultado_parametro,
            fecha: fecha || new Date()
        };

        const newResultado = await ResultadoService.createResultado(resultadoData);
        
        res.status(201).json({ 
            message: "Resultado registrado con éxito", 
            resultado: newResultado 
        });
    } catch (error) {
        console.log("Error al crear resultado:", error.message);
        res.status(500).json({ error: "Error al registrar el resultado" });
    }
};

// Controlador para obtener todos los resultados
export const getAllResultados = async (req, res) => {
    try {
        const resultados = await ResultadoService.getAllResultados();
        res.status(200).json(resultados);
    } catch (error) {
        console.log("Error al obtener resultados:", error.message);
        res.status(500).json({ error: "Error al obtener los resultados" });
    }
};

// Controlador para obtener resultados por paciente
export const getResultadosByPaciente = async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const resultados = await ResultadoService.getResultadosByPaciente(id_paciente);
        res.status(200).json(resultados);
    } catch (error) {
        console.log("Error al obtener resultados:", error.message);
        res.status(500).json({ error: "Error al obtener los resultados" });
    }
};

// Controlador para obtener resultados por análisis
export const getResultadosByAnalisis = async (req, res) => {
    try {
        const { id_analisis } = req.params;
        const resultados = await ResultadoService.getResultadosByAnalisis(id_analisis);
        res.status(200).json(resultados);
    } catch (error) {
        console.log("Error al obtener resultados:", error.message);
        res.status(500).json({ error: "Error al obtener los resultados" });
    }
};

// Controlador para obtener un resultado por ID
export const getResultadoById = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ResultadoService.getResultadoById(id);
        res.status(200).json(resultado);
    } catch (error) {
        console.log("Error al obtener resultado:", error.message);
        
        if (error.message === "Resultado no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener el resultado" });
    }
};

// Controlador para actualizar resultado
export const updateResultado = async (req, res) => {
    try {
        const { id } = req.params;
        const { resultado_parametro } = req.body;

        if (!resultado_parametro) {
            return res.status(400).json({ error: "El resultado es obligatorio" });
        }

        const updatedResultado = await ResultadoService.updateResultado(id, resultado_parametro);
        
        res.status(200).json({ 
            message: "Resultado actualizado con éxito", 
            resultado: updatedResultado 
        });
    } catch (error) {
        console.log("Error al actualizar resultado:", error.message);
        
        if (error.message === "Resultado no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar el resultado" });
    }
};

// Controlador para eliminar resultado
export const deleteResultado = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ResultadoService.deleteResultado(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar resultado:", error.message);
        
        if (error.message === "Resultado no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar el resultado" });
    }
};
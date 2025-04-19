import { UbicacionService } from "../services/ubicacionService.js";

// Controlador para obtener todos los estados
export const getAllEstados = async (req, res) => {
    try {
        const estados = await UbicacionService.getAllEstados();
        res.status(200).json(estados);
    } catch (error) {
        console.log("Error al obtener estados:", error.message);
        res.status(500).json({ error: "Error al obtener estados" });
    }
};

// Controlador para obtener todos los municipios
export const getAllMunicipios = async (req, res) => {
    try {
        const municipios = await UbicacionService.getAllMunicipios();
        res.status(200).json(municipios);
    } catch (error) {
        console.log("Error al obtener municipios:", error.message);
        res.status(500).json({ error: "Error al obtener municipios" });
    }
};

// Controlador para obtener municipios por estado
export const getMunicipiosByEstado = async (req, res) => {
    try {
        const { id_estado } = req.params;
        
        if (!id_estado) {
            return res.status(400).json({ error: "El ID del estado es obligatorio" });
        }
        
        const municipios = await UbicacionService.getMunicipiosByEstado(id_estado);
        res.status(200).json(municipios);
    } catch (error) {
        console.log("Error al obtener municipios por estado:", error.message);
        res.status(500).json({ error: "Error al obtener municipios" });
    }
};
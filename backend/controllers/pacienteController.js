import { PacienteService } from "../services/pacienteService.js";

// Controlador para crear pacientes
export const createPaciente = async (req, res) => {
    try {
        const {
            cedula,
            tipo_cedula,
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        } = req.body;

        // Validaciones
        if (!cedula || !tipo_cedula || !nombres || !apellidos || !id_estado || !id_municipio) {
            return res.status(400).json({
                error: "Cédula, tipo de cédula, nombres, apellidos, estado y municipio son obligatorios"
            });
        }

        const pacienteData = {
            cedula,
            tipo_cedula,
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        };

        const newPaciente = await PacienteService.createPaciente(pacienteData);

        res.status(201).json({
            message: "Paciente creado con éxito",
            paciente: newPaciente
        });
    } catch (error) {
        console.log("Error al crear paciente:", error.message);

        if (error.message.includes("Ya existe un paciente con esta cédula")) {
            return res.status(409).json({ error: error.message });
        }

        res.status(500).json({ error: "Error al crear el paciente" });
    }
};

// Controlador para obtener todos los pacientes
export const getAllPacientes = async (req, res) => {
    try {
        const pacientes = await PacienteService.getAllPacientes();
        res.status(200).json(pacientes);
    } catch (error) {
        console.log("Error al obtener pacientes:", error.message);
        res.status(500).json({ error: "Error al obtener los pacientes" });
    }
};

// Controlador para obtener estadísticas de pacientes
export const getPacienteStats = async (req, res) => {
    try {
        const stats = await PacienteService.getStats();

        // Añadimos log para debug
        console.log("Estadísticas generadas:", stats);

        res.status(200).json(stats);
    } catch (error) {
        console.log("Error al obtener estadísticas de pacientes:", error.message);
        res.status(500).json({ error: "Error al obtener estadísticas de pacientes" });
    }
};

// Controlador para obtener un paciente por ID
export const getPacienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const paciente = await PacienteService.getPacienteById(id);
        res.status(200).json(paciente);
    } catch (error) {
        console.log("Error al obtener paciente:", error.message);

        if (error.message === "Paciente no encontrado") {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: "Error al obtener el paciente" });
    }
};



// Controlador para buscar pacientes
export const searchPacientes = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 3) {
            return res.status(400).json({
                error: "El término de búsqueda debe tener al menos 3 caracteres"
            });
        }

        const pacientes = await PacienteService.searchPacientes(q);
        res.status(200).json(pacientes);
    } catch (error) {
        console.log("Error al buscar pacientes:", error.message);
        res.status(500).json({ error: "Error al buscar pacientes" });
    }
};

// Controlador para actualizar pacientes
export const updatePaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        } = req.body;

        const pacienteData = {
            nombres,
            apellidos,
            nacimiento,
            id_estado,
            id_municipio,
            telefono,
            email,
            direccion
        };

        const updatedPaciente = await PacienteService.updatePaciente(id, pacienteData);

        res.status(200).json({
            message: "Paciente actualizado con éxito",
            paciente: updatedPaciente
        });
    } catch (error) {
        console.log("Error al actualizar paciente:", error.message);

        if (error.message === "Paciente no encontrado") {
            return res.status(404).json({ error: error.message });
        }

        if (error.message === "No hay datos para actualizar") {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: "Error al actualizar el paciente" });
    }
};

// Controlador para eliminar pacientes
export const deletePaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PacienteService.deletePaciente(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar paciente:", error.message);

        if (error.message === "Paciente no encontrado") {
            return res.status(404).json({ error: error.message });
        }

        if (error.message.includes("tiene resultados de análisis asociados")) {
            return res.status(409).json({ error: error.message });
        }

        res.status(500).json({ error: "Error al eliminar el paciente" });
    }
};
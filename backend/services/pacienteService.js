import pool from "../lib/db.js";

export class PacienteService {
    // Crear paciente
    static async createPaciente(pacienteData) {
        const { 
            cedula, 
            nombres, 
            apellidos, 
            edad, 
            direccion, 
            telefono, 
            email 
        } = pacienteData;

        // Verificar si el paciente ya existe
        const existingPatient = await pool.query(
            "SELECT * FROM paciente WHERE cedula = $1", 
            [cedula]
        );

        if (existingPatient.rows.length > 0) {
            throw new Error("Ya existe un paciente con esta cédula");
        }

        // Insertar nuevo paciente
        const query = `
            INSERT INTO paciente (
                cedula, nombres, apellidos, edad, direccion, telefono, email
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id_paciente, cedula, nombres, apellidos, edad, direccion, telefono, email
        `;
        
        const values = [
            cedula, 
            nombres, 
            apellidos, 
            edad || null, 
            direccion || null, 
            telefono || null, 
            email || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Obtener todos los pacientes
    static async getAllPacientes() {
        const query = `
            SELECT id_paciente, cedula, nombres, apellidos, edad, direccion, telefono, email
            FROM paciente
            ORDER BY apellidos, nombres
        `;
        
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener un paciente por ID
    static async getPacienteById(id) {
        const query = `
            SELECT id_paciente, cedula, nombres, apellidos, edad, direccion, telefono, email
            FROM paciente
            WHERE id_paciente = $1
        `;
        
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }
        
        return rows[0];
    }

    // Buscar pacientes por nombre, apellido o cédula
    static async searchPacientes(searchTerm) {
        const query = `
            SELECT id_paciente, cedula, nombres, apellidos, edad, direccion, telefono, email
            FROM paciente
            WHERE 
                cedula ILIKE $1 OR
                nombres ILIKE $1 OR
                apellidos ILIKE $1
            ORDER BY apellidos, nombres
        `;
        
        const { rows } = await pool.query(query, [`%${searchTerm}%`]);
        return rows;
    }

    // Actualizar paciente
    static async updatePaciente(id, pacienteData) {
        const { 
            cedula, 
            nombres, 
            apellidos, 
            edad, 
            direccion, 
            telefono, 
            email 
        } = pacienteData;

        // Construir la consulta de actualización dinámicamente
        let query = "UPDATE paciente SET";
        const values = [];
        const updateFields = [];
        let paramIndex = 1;

        // Añadir campos que existen en pacienteData
        if (cedula !== undefined) {
            updateFields.push(` cedula = $${paramIndex++}`);
            values.push(cedula);
        }

        if (nombres !== undefined) {
            updateFields.push(` nombres = $${paramIndex++}`);
            values.push(nombres);
        }

        if (apellidos !== undefined) {
            updateFields.push(` apellidos = $${paramIndex++}`);
            values.push(apellidos);
        }

        if (edad !== undefined) {
            updateFields.push(` edad = $${paramIndex++}`);
            values.push(edad);
        }

        if (direccion !== undefined) {
            updateFields.push(` direccion = $${paramIndex++}`);
            values.push(direccion);
        }

        if (telefono !== undefined) {
            updateFields.push(` telefono = $${paramIndex++}`);
            values.push(telefono);
        }

        if (email !== undefined) {
            updateFields.push(` email = $${paramIndex++}`);
            values.push(email);
        }

        // Verificar si hay campos para actualizar
        if (updateFields.length === 0) {
            throw new Error("No hay datos para actualizar");
        }

        // Completar la consulta
        query += updateFields.join(",");
        query += ` WHERE id_paciente = $${paramIndex} RETURNING id_paciente, cedula, nombres, apellidos, edad, direccion, telefono, email`;
        values.push(id);

        // Ejecutar la consulta
        const { rows } = await pool.query(query, values);
        
        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar paciente
    static async deletePaciente(id) {
        // Primero verificar si hay resultados asociados
        const resultadosCheck = await pool.query(
            "SELECT COUNT(*) FROM resultado_analisis WHERE id_paciente = $1",
            [id]
        );
        
        if (parseInt(resultadosCheck.rows[0].count) > 0) {
            throw new Error("No se puede eliminar el paciente porque tiene resultados de análisis asociados");
        }
        
        const query = "DELETE FROM paciente WHERE id_paciente = $1 RETURNING id_paciente";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Paciente no encontrado");
        }
        
        return { id: rows[0].id_paciente, message: "Paciente eliminado exitosamente" };
    }
}
import pool from "../lib/db.js";
import bcrypt from "bcryptjs";

export class UserService {
    // Crear usuario con todos los campos de la tabla
    static async createUser(userData) {
        const { 
            usuario, 
            contraseña, 
            cedula,
            tipo_cedula, 
            nombre, 
            apellido, 
            celular, 
            imagen, 
            id_tipo 
        } = userData;

        // Verificar si el usuario ya existe
        const existingUser = await pool.query(
            "SELECT * FROM usuario WHERE usuario = $1 OR cedula = $2", 
            [usuario, cedula]
        );

        if (existingUser.rows.length > 0) {
            const existingField = existingUser.rows[0].usuario === usuario ? 'usuario' : 'cédula';
            throw new Error(`Este ${existingField} ya está registrado`);
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);
        
        // Insertar nuevo usuario - CORREGIDO: Se añadió el 9º placeholder para id_tipo
        const query = `
            INSERT INTO usuario (
                usuario, contraseña, cedula,
                tipo_cedula, nombre, apellido, 
                celular, imagen, id_tipo
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id_user, usuario, cedula, tipo_cedula, nombre, apellido, celular, imagen, id_tipo
        `;
        
        const values = [
            usuario, 
            hashedPassword, 
            cedula,
            tipo_cedula, 
            nombre, 
            apellido, 
            celular, 
            imagen || null, 
            id_tipo
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Obtener todos los usuarios con información de tipo
    static async getAllUsers() {
        const query = `
            SELECT u.id_user, u.usuario, u.nombre, u.apellido, u.cedula,
            u.tipo_cedula, 
                   u.celular, u.imagen, u.id_tipo, t.tipo_user 
            FROM usuario u
            JOIN tipo_user t ON u.id_tipo = t.id_tipo
            ORDER BY u.nombre, u.apellido
        `;
        
        const { rows } = await pool.query(query);
        return rows;
    }

    // Obtener un usuario por ID
    static async getUserById(id) {
        const query = `
            SELECT u.id_user, u.usuario, u.nombre, u.apellido, u.cedula,
            u.tipo_cedula, 
                   u.celular, u.imagen, u.id_tipo, t.tipo_user 
            FROM usuario u
            JOIN tipo_user t ON u.id_tipo = t.id_tipo
            WHERE u.id_user = $1
        `;
        
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        
        return rows[0];
    }

    // Actualizar usuario
    static async updateUser(id, userData) {
        const { 
            usuario, 
            contraseña, 
            cedula,
            tipo_cedula, 
            nombre, 
            apellido, 
            celular, 
            imagen, 
            id_tipo 
        } = userData;

        // Construir la consulta de actualización dinámicamente
        let query = "UPDATE usuario SET";
        const values = [];
        const updateFields = [];
        let paramIndex = 1;

        // Añadir campos que existen en userData
        if (usuario !== undefined) {
            updateFields.push(` usuario = $${paramIndex++}`);
            values.push(usuario);
        }

        if (contraseña !== undefined) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contraseña, salt);
            updateFields.push(` contraseña = $${paramIndex++}`);
            values.push(hashedPassword);
        }

        if (cedula !== undefined) {
            updateFields.push(` cedula = $${paramIndex++}`);
            values.push(cedula);
        }

        if (tipo_cedula !== undefined) {
            updateFields.push(` tipo_cedula = $${paramIndex++}`);
            values.push(tipo_cedula);
        }

        if (nombre !== undefined) {
            updateFields.push(` nombre = $${paramIndex++}`);
            values.push(nombre);
        }

        if (apellido !== undefined) {
            updateFields.push(` apellido = $${paramIndex++}`);
            values.push(apellido);
        }

        if (celular !== undefined) {
            updateFields.push(` celular = $${paramIndex++}`);
            values.push(celular);
        }

        if (imagen !== undefined) {
            updateFields.push(` imagen = $${paramIndex++}`);
            values.push(imagen);
        }

        if (id_tipo !== undefined) {
            updateFields.push(` id_tipo = $${paramIndex++}`);
            values.push(id_tipo);
        }

        // Verificar si hay campos para actualizar
        if (updateFields.length === 0) {
            throw new Error("No hay datos para actualizar");
        }

        // Completar la consulta
        query += updateFields.join(",");
        query += ` WHERE id_user = $${paramIndex} RETURNING id_user, usuario, nombre, apellido, cedula, tipo_cedula, celular, imagen, id_tipo`;
        values.push(id);

        // Ejecutar la consulta
        const { rows } = await pool.query(query, values);
        
        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        
        return rows[0];
    }

    // Eliminar usuario
    static async deleteUser(id) {
        const query = "DELETE FROM usuario WHERE id_user = $1 RETURNING id_user";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        
        return { id: rows[0].id_user, message: "Usuario eliminado exitosamente" };
    }

    // Obtener todos los tipos de usuario
    static async getUserTypes() {
        const query = "SELECT id_tipo, tipo_user, descripcion FROM tipo_user ORDER BY tipo_user";
        const { rows } = await pool.query(query);
        return rows;
    }

    // Verificar si existen usuarios en el sistema
    static async checkIfUsersExist() {
        const query = "SELECT COUNT(*) as count FROM usuario";
        const { rows } = await pool.query(query);
        return parseInt(rows[0].count) > 0;
    }

    // Crear el primer administrador (sin validación de token)
    static async createFirstAdmin(userData) {
        // Verificar si ya existen usuarios
        const usersExist = await this.checkIfUsersExist();
        
        if (usersExist) {
            throw new Error("No se puede crear el primer administrador porque ya existen usuarios en el sistema");
        }
        
        // Validar que sea tipo administrador (Jefe)
        if (userData.id_tipo !== 1) {
            throw new Error("El primer usuario debe ser un administrador (Jefe)");
        }
        
        // Usar el método existente para crear el usuario
        return await this.createUser(userData);
    }

    // Método para cambiar contraseña verificando la contraseña actual
    static async changePassword(userId, currentPassword, newPassword) {
        // 1. Obtener usuario con su contraseña actual
        const query = "SELECT contraseña FROM usuario WHERE id_user = $1";
        const { rows } = await pool.query(query, [userId]);
        
        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        
        const user = rows[0];
        
        // 2. Verificar que la contraseña actual sea correcta
        const isPasswordValid = await bcrypt.compare(currentPassword, user.contraseña);
        if (!isPasswordValid) {
            throw new Error("Contraseña actual incorrecta");
        }
        
        // 3. Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // 4. Actualizar la contraseña
        const updateQuery = "UPDATE usuario SET contraseña = $1 WHERE id_user = $2 RETURNING id_user";
        const updateResult = await pool.query(updateQuery, [hashedPassword, userId]);
        
        if (updateResult.rows.length === 0) {
            throw new Error("Error al actualizar la contraseña");
        }
        
        return { success: true };
    }
}
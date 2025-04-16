import { UserService } from "../services/userService.js";

// Controlador para crear usuarios
export const createUser = async (req, res) => {
    try {
        const { 
            usuario, 
            contraseña, 
            confirmarContraseña,
            cedula, 
            nombre, 
            apellido, 
            celular, 
            id_tipo 
        } = req.body;

        // Validaciones
        if (!usuario || !contraseña || !confirmarContraseña || !cedula || !nombre || !apellido || !id_tipo) {
            return res.status(400).json({ 
                error: "Todos los campos marcados son obligatorios" 
            });
        }

        if (contraseña !== confirmarContraseña) {
            return res.status(400).json({ 
                error: "Las contraseñas no coinciden" 
            });
        }

        // Obtener la imagen del request (en caso de tenerla)
        const imagen = req.file ? req.file.filename : null;

        // Crear usuario
        const userData = {
            usuario,
            contraseña,
            cedula,
            nombre,
            apellido,
            celular,
            imagen,
            id_tipo
        };

        const newUser = await UserService.createUser(userData);
        
        res.status(201).json({ 
            message: "Usuario creado con éxito", 
            user: newUser 
        });
    } catch (error) {
        console.log("Error al crear usuario:", error.message);
        
        if (error.message.includes("ya está registrado")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al crear el usuario" });
    }
};

// Controlador para obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.log("Error al obtener usuarios:", error.message);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};

// Controlador para obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        res.status(200).json(user);
    } catch (error) {
        console.log("Error al obtener usuario:", error.message);
        
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al obtener el usuario" });
    }
};

// Controlador para actualizar usuarios
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            usuario, 
            contraseña, 
            cedula, 
            nombre, 
            apellido, 
            celular, 
            id_tipo 
        } = req.body;

        // Obtener la imagen del request (en caso de tenerla)
        const imagen = req.file ? req.file.filename : undefined;

        // Datos para actualizar
        const userData = {
            usuario,
            contraseña,
            cedula,
            nombre,
            apellido,
            celular,
            imagen,
            id_tipo
        };

        const updatedUser = await UserService.updateUser(id, userData);
        
        res.status(200).json({ 
            message: "Usuario actualizado con éxito", 
            user: updatedUser 
        });
    } catch (error) {
        console.log("Error al actualizar usuario:", error.message);
        
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message === "No hay datos para actualizar") {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
};

// Controlador para eliminar usuarios
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserService.deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error al eliminar usuario:", error.message);
        
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
};

// Controlador para obtener todos los tipos de usuario
export const getUserTypes = async (req, res) => {
    try {
        const types = await UserService.getUserTypes();
        res.status(200).json(types);
    } catch (error) {
        console.log("Error al obtener tipos de usuario:", error.message);
        res.status(500).json({ error: "Error al obtener los tipos de usuario" });
    }
};

// Controlador para crear el primer administrador (sin autenticación)
export const createFirstAdmin = async (req, res) => {
    try {
        const { 
            usuario, 
            contraseña, 
            confirmarContraseña,
            cedula, 
            nombre, 
            apellido, 
            celular
        } = req.body;

        // Validaciones
        if (!usuario || !contraseña || !confirmarContraseña || !cedula || !nombre || !apellido) {
            return res.status(400).json({ 
                error: "Todos los campos marcados son obligatorios" 
            });
        }

        if (contraseña !== confirmarContraseña) {
            return res.status(400).json({ 
                error: "Las contraseñas no coinciden" 
            });
        }

        // Crear primer admin (id_tipo = 1 forzado)
        const userData = {
            usuario,
            contraseña,
            cedula,
            nombre,
            apellido,
            celular,
            imagen: null,
            id_tipo: 1 // Forzar a que sea Jefe/Admin
        };

        const newUser = await UserService.createFirstAdmin(userData);
        
        res.status(201).json({ 
            message: "Administrador inicial creado con éxito", 
            user: newUser 
        });
    } catch (error) {
        console.log("Error al crear administrador inicial:", error.message);
        
        if (error.message.includes("ya existe")) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: error.message });
    }
};

// Controlador para cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { contraseñaActual, contraseña, confirmarContraseña } = req.body;
        
        // Validaciones básicas
        if (!contraseñaActual || !contraseña || !confirmarContraseña) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        
        // Validar que las contraseñas coincidan
        if (contraseña !== confirmarContraseña) {
            return res.status(400).json({ error: "Las contraseñas no coinciden" });
        }
        
        // Validar longitud mínima de contraseña
        if (contraseña.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }
        
        // Usar el service para cambiar la contraseña
        await UserService.changePassword(id, contraseñaActual, contraseña);
        
        // Responder con éxito
        res.status(200).json({ 
            success: true,
            message: "Contraseña actualizada con éxito" 
        });
    } catch (error) {
        console.log("Error al cambiar contraseña:", error.message);
        
        // Manejar errores específicos
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message === "Contraseña actual incorrecta") {
            return res.status(401).json({ error: error.message });
        }
        
        // Error genérico
        res.status(500).json({ error: "Error al cambiar la contraseña" });
    }
};

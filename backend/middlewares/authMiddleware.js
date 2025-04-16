import { AuthService } from "../services/authService.js";

// Middleware para autenticar usuarios
export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "Acceso denegado, no hay token" });
        }

        // Verificar token
        const decoded = await AuthService.verifyToken(token);
        
        // Asegurar que el payload tenga id_user
        if (!decoded.id_user) {
            return res.status(403).json({ error: "Token inválido: falta id_user" });
        }

        // Agregar usuario decodificado a la request
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error en autenticación:", error.message);
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};

// Middleware para verificar roles de usuario
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }
        
        if (!roles.includes(req.user.tipo_user)) {
            return res.status(403).json({ 
                error: "No tienes permiso para realizar esta acción" 
            });
        }
        
        next();
    };
};
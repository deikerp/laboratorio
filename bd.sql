-- 1. Tabla Rol (tipo_user) - Debe crearse primero
CREATE TABLE tipo_user (
    id_tipo SERIAL PRIMARY KEY,
    tipo_user VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 2. Tabla Usuario (base para otras tablas)
CREATE TABLE usuario (
    id_user SERIAL PRIMARY KEY,
    usuario VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    imagen VARCHAR(255),
    id_tipo INT NOT NULL,
    FOREIGN KEY (id_tipo) REFERENCES tipo_user (id_tipo)
);

-- 3. Tabla Paciente
CREATE TABLE paciente (
    id_paciente SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
  nacimiento varchar(20) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

-- 4. Tabla Categoria Analisis
CREATE TABLE categoria_analisis (
    id_categoria SERIAL PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL
);

-- 5. Tabla Analisis
CREATE TABLE analisis (
    id_analisis SERIAL PRIMARY KEY,
    id_categoria INT,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria_analisis (id_categoria)
);

-- 6. Tabla Reactivo
CREATE TABLE reactivo (
    id_reactivo SERIAL PRIMARY KEY,
    nombre_reactivo VARCHAR(100) NOT NULL
);

-- 7. Tabla Parametros
CREATE TABLE parametros (
    id_parametro SERIAL PRIMARY KEY,
    id_analisis INT,
    id_reactivo INT,
    nombre_parametro VARCHAR(100) NOT NULL,
    valor_referencial VARCHAR(100),
    FOREIGN KEY (id_analisis) REFERENCES analisis (id_analisis),
    FOREIGN KEY (id_reactivo) REFERENCES reactivo (id_reactivo)
);

-- 8. Tabla Resultado Analisis
CREATE TABLE resultado_analisis (
    id_resultado SERIAL PRIMARY KEY,
    id_paciente INT,
    id_analisis INT,
    id_parametro INT,
    valor_referencial VARCHAR(100),
    resultado_parametro VARCHAR(100),
    fecha DATE,
    FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente),
    FOREIGN KEY (id_analisis) REFERENCES analisis (id_analisis),
    FOREIGN KEY (id_parametro) REFERENCES parametros (id_parametro)
);


-- Insertar tipos de usuarios
INSERT INTO tipo_user (id_tipo, tipo_user, descripcion) VALUES 
(1, 'Jefe', 'Administrador del sistema con acceso total'),
(2, 'Bioanalista', 'Profesional encargado de realizar análisis de laboratorio'),
(3, 'Recepcionista', 'Personal encargado de atender pacientes y gestionar citas');

-- Crear usuario administrador (contraseña: "1234")
-- El hash corresponde a la contraseña "1234" usando bcrypt
INSERT INTO usuario (usuario, contraseña, cedula, nombre, apellido, celular, id_tipo) 
VALUES ('admin', '$2a$10$tU0ogdYjj16M3lGiGD4LM.QAiuifT1ayjIMVb8PoN7XG47a7vvtIe', 'V-12345678', 'Administrador', 'Sistema', '04121234567', 1);


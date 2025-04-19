-- --------------------------------------------------------
-- 1. Tabla tipo_user (Roles)
-- --------------------------------------------------------
CREATE TABLE tipo_user (
    id_tipo      SERIAL PRIMARY KEY,
    tipo_user    VARCHAR(50) NOT NULL UNIQUE,
    descripcion  TEXT
);

-- --------------------------------------------------------
-- 2. Tabla estado (Movido antes de paciente)
-- --------------------------------------------------------
CREATE TABLE estado (
    id_estado     SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL
);

-- --------------------------------------------------------
-- 3. Tabla municipio (Movido antes de paciente)
-- --------------------------------------------------------
CREATE TABLE municipio (
    id_municipio     SERIAL PRIMARY KEY,
    nombre_municipio VARCHAR(50) NOT NULL,
    id_estado        INT NOT NULL
        REFERENCES estado (id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 4. Tabla usuario
-- --------------------------------------------------------
CREATE TABLE usuario (
    id_user      SERIAL PRIMARY KEY,
    usuario      VARCHAR(150) NOT NULL UNIQUE,
    contraseña   VARCHAR(150) NOT NULL,
    cedula       VARCHAR(20)  NOT NULL UNIQUE,
    tipo_cedula  VARCHAR(10)  NOT NULL,
    nombre       VARCHAR(50)  NOT NULL,
    apellido     VARCHAR(50)  NOT NULL,
    celular      VARCHAR(20)  NOT NULL,
    imagen       VARCHAR(255),
    id_tipo      INT          NOT NULL
        REFERENCES tipo_user (id_tipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 5. Tabla paciente (Con sintaxis corregida)
-- --------------------------------------------------------
CREATE TABLE paciente (
    id_paciente  SERIAL PRIMARY KEY,
    cedula       VARCHAR(20)  NOT NULL,
    tipo_cedula  VARCHAR(10)  NOT NULL,
    nombres      VARCHAR(100) NOT NULL,
    apellidos    VARCHAR(100) NOT NULL,
    nacimiento   DATE         NOT NULL,
    id_estado    INT          NOT NULL
        REFERENCES estado (id_estado),
    id_municipio INT          NOT NULL
        REFERENCES municipio (id_municipio),
    telefono     VARCHAR(20),
    email        VARCHAR(100),
    direccion    VARCHAR(255)
);

-- --------------------------------------------------------
-- 6. Tabla categoria_analisis
-- --------------------------------------------------------
CREATE TABLE categoria_analisis (
    id_categoria SERIAL PRIMARY KEY,
    categoria    VARCHAR(100) NOT NULL
);

-- --------------------------------------------------------
-- 7. Tabla analisis
-- --------------------------------------------------------
CREATE TABLE analisis (
    id_analisis  SERIAL PRIMARY KEY,
    id_categoria INT
        REFERENCES categoria_analisis (id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    nombre       VARCHAR(100) NOT NULL
);

-- --------------------------------------------------------
-- 8. Tabla reactivo
-- --------------------------------------------------------
CREATE TABLE reactivo (
    id_reactivo   SERIAL PRIMARY KEY,
    nombre_reactivo VARCHAR(100) NOT NULL
);

-- --------------------------------------------------------
-- 9. Tabla parametros
-- --------------------------------------------------------
CREATE TABLE parametros (
    id_parametro     SERIAL PRIMARY KEY,
    id_analisis      INT
        REFERENCES analisis (id_analisis)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    id_reactivo      INT
        REFERENCES reactivo (id_reactivo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    nombre_parametro VARCHAR(100) NOT NULL,
    valor_referencial VARCHAR(100)
);

-- --------------------------------------------------------
-- 10. Tabla resultado_analisis
-- --------------------------------------------------------
CREATE TABLE resultado_analisis (
    id_resultado        SERIAL PRIMARY KEY,
    id_paciente         INT
        REFERENCES paciente (id_paciente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    id_analisis         INT
        REFERENCES analisis (id_analisis)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    id_parametro        INT
        REFERENCES parametros (id_parametro)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    valor_referencial   VARCHAR(100),
    resultado_parametro VARCHAR(100),
    fecha               DATE
);

-- --------------------------------------------------------
-- Insertar tipos de usuario y usuario administrador
-- --------------------------------------------------------
INSERT INTO tipo_user (id_tipo, tipo_user, descripcion) VALUES
  (1, 'Jefe',        'Administrador del sistema con acceso total'),
  (2, 'Bioanalista', 'Profesional encargado de realizar análisis de laboratorio'),
  (3, 'Recepcionista', 'Personal encargado de atender pacientes y gestionar citas');

-- Población de estados
INSERT INTO estado (id_estado, nombre_estado) VALUES
  (1, 'Amazonas'),
  (2, 'Anzoategui'),
  (3, 'Apure'),
  (4, 'Aragua'),
  (5, 'Barinas'),
  (6, 'Bolivar'),
  (7, 'Carabobo'),
  (8, 'Cojedes'),
  (9, 'Delta Amacuro'),
  (10, 'Distrito Capital'),
  (11, 'Falcon'),
  (12, 'Guarico'),
  (13, 'Lara'),
  (14, 'Merida'),
  (15, 'Monagas'),
  (16, 'Nueva Esparta'),
  (17, 'Portuguesa'),
  (18, 'Sucre'),
  (19, 'Tachira'),
  (20, 'Trujillo'),
  (21, 'Vargas'),
  (22, 'Yaracuy'),
  (23, 'Zulia');

-- Población de municipios
INSERT INTO municipio (id_municipio, nombre_municipio, id_estado) VALUES
  (1, 'Atabapo', 1),
  (2, 'Atures', 1),
  (3, 'Autana', 1),
  (4, 'Maroa', 1),
  (5, 'Manapiare', 1),
  (6, 'Rio Negro', 1),
  (7, 'Anaco', 2),
  (9, 'Bolivar', 2),
  (10, 'Bruzual', 2),
  (11, 'Cajigal', 2),
  (12, 'Carvajal', 2),
  (13, 'Diego Bautista Urbaneja', 2),
  (14, 'Freites', 2),
  (15, 'Guanipa', 2),
  (16, 'Guanta', 2),
  (17, 'Independencia', 2),
  (18, 'Libertad', 2),
  (19, 'McGregor', 2),
  (20, 'Miranda', 2),
  (21, 'Monagas', 2),
  (22, 'Penalver', 2),
  (23, 'Piritu', 2),
  (24, 'San Juan de Capistrano', 2),
  (25, 'Santa Ana', 2),
  (26, 'Simon Rodriguez', 2),
  (27, 'Sotillo', 2),
  (28, 'Achaguas', 3),
  (29, 'Biruaca', 3),
  (30, 'Munoz', 3),
  (31, 'Paez', 3),
  (32, 'Pedro Camejo', 3),
  (33, 'Romulo Gallegos', 3),
  (34, 'San Fernando', 3),
  (53, 'Bolivar', 4),
  (54, 'Camatagua', 4),
  (55, 'Francisco Linares Alcantara', 4),
  (56, 'Girardot', 4),
  (57, 'Jose Angel Lamas', 4),
  (58, 'Jose Felix Ribas', 4),
  (59, 'Jose Rafael Revenga', 4),
  (60, 'Libertador', 4),
  (61, 'Mario Briceno Iragorry', 4),
  (62, 'Ocumare de la Costa', 4),
  (63, 'San Casimiro', 4),
  (64, 'San Sebastian', 4),
  (65, 'Santiago Marino', 4),
  (66, 'Santos Michelena', 4),
  (67, 'Sucre', 4),
  (68, 'Tovar', 4),
  (69, 'Urdaneta', 4),
  (70, 'Zamora', 4),
  (71, 'Alberto Arvelo Torrealba', 5),
  (72, 'Andres Eloy Blanco', 5),
  (73, 'Antonio Jose de Sucre', 5),
  (74, 'Arismendi', 5),
  (75, 'Barinas', 5),
  (76, 'Bolivar', 5),
  (77, 'Cruz Paredes', 5),
  (78, 'Ezequiel Zamora', 5),
  (79, 'Obispos', 5),
  (80, 'Pedraza', 5),
  (81, 'Rojas', 5),
  (82, 'Sosa', 5),
  (83, 'Caroni', 6),
  (84, 'Cedeno', 6),
  (85, 'El Callao', 6),
  (86, 'Gran Sabana', 6),
  (87, 'Heres', 6),
  (88, 'Piar', 6),
  (89, 'Raul Leoni', 6),
  (90, 'Roscio', 6),
  (91, 'Sifontes', 6),
  (92, 'Sucre', 6),
  (93, 'Padre Pedro Chien', 6),
  (94, 'Bejuma', 7),
  (95, 'Carlos Arvelo', 7),
  (96, 'Diego Ibarra', 7),
  (97, 'Guacara', 7),
  (98, 'Juan Jose Mora', 7),
  (99, 'Libertador', 7),
  (100, 'Los Guayos', 7),
  (101, 'Miranda', 7),
  (102, 'Montalban', 7),
  (103, 'Naguanagua', 7),
  (104, 'Puerto Cabello', 7),
  (105, 'San Diego', 7),
  (106, 'San Joaquin', 7),
  (107, 'Valencia', 7),
  (109, 'Tinaquillo', 8),
  (110, 'Girardot', 8),
  (111, 'Lima Blanco', 8),
  (112, 'Pao de San Juan Bautista', 8),
  (113, 'Ricaurte', 8),
  (114, 'Romulo Gallegos', 8),
  (115, 'San Carlos', 8),
  (116, 'Tinaco', 8),
  (117, 'Antonio Diaz', 9),
  (118, 'Casacoima', 9),
  (119, 'Pedernales', 9),
  (120, 'Tucupita', 9),
  (121, 'Libertador', 10),
  (122, 'Acosta', 11),
  (123, 'Bolivar', 11),
  (124, 'Buchivacoa', 11),
  (125, 'Cacique Manaure', 11),
  (126, 'Carirubana', 11),
  (127, 'Colina', 11),
  (128, 'Dabajuro', 11),
  (129, 'Democracia', 11),
  (130, 'Falcon', 11),
  (131, 'Federacion', 11),
  (132, 'Jacura', 11),
  (133, 'Los Taques', 11),
  (134, 'Mauroa', 11),
  (135, 'Miranda', 11),
  (136, 'Palmasola', 11),
  (137, 'Petit', 11),
  (138, 'Piritu', 11),
  (139, 'San Francisco', 11),
  (140, 'Silva', 11),
  (141, 'Sucre', 11),
  (142, 'Tocopero', 11),
  (143, 'Union', 11),
  (144, 'Urumaco', 11),
  (145, 'Zamora', 11),
  (146, 'Camaguan', 12),
  (147, 'Chaguaramas', 12),
  (148, 'El Socorro', 12),
  (149, 'Jose Felix Ribas', 12),
  (150, 'Jose Tadeo Monagas', 12),
  (151, 'Juan German Roscio', 12),
  (152, 'Julian Mellado', 12),
  (153, 'Las Mercedes', 12),
  (154, 'Leonardo Infante', 12),
  (155, 'Pedro Zaraza', 12),
  (156, 'Ortiz', 12),
  (157, 'San Geronimo de Guayabal', 12),
  (158, 'San Jose de Guaribe', 12),
  (159, 'Santa Maria de Ipire', 12),
  (160, 'Andres Eloy Blanco', 13),
  (161, 'Crespo', 13),
  (162, 'Iribarren', 13),
  (163, 'Jimenez', 13),
  (164, 'Moran', 13),
  (165, 'Palavecino', 13),
  (166, 'Simon Planas', 13),
  (167, 'Torres', 13),
  (168, 'Urdaneta', 13),
  (169, 'Alberto Adriani', 14),
  (170, 'Andres Bello', 14),
  (171, 'Antonio Pinto Salinas', 14),
  (172, 'Aricagua', 14),
  (173, 'Arzobispo Chacon', 14),
  (174, 'Campo Elias', 14),
  (175, 'Caracciolo Parra Olmedo', 14),
  (176, 'Cardenal Quintero', 14),
  (177, 'Guaraque', 14),
  (178, 'Julio Cesar Salas', 14),
  (179, 'Justo Briceño', 14),
  (180, 'Libertador', 14),
  (181, 'Miranda', 14),
  (182, 'Obispo Ramos de Lora', 14),
  (183, 'Padre Noguera', 14),
  (184, 'Pueblo Llano', 14),
  (185, 'Rangel', 14),
  (186, 'Rivas Davila', 14),
  (187, 'Santos Marquina', 14),
  (188, 'Sucre', 14),
  (189, 'Tovar', 14),
  (190, 'Tulio Febres Cordero', 14),
  (191, 'Zea', 14),
  (192, 'Acosta', 15),
  (193, 'Aguasay', 15),
  (194, 'Bolivar', 15),
  (195, 'Caripe', 15),
  (196, 'Cedeno', 15),
  (197, 'Ezequiel Zamora', 15),
  (198, 'Libertador', 15),
  (199, 'Maturin', 15),
  (200, 'Piar', 15),
  (201, 'Punceres', 15),
  (202, 'Santa Barbara', 15),
  (203, 'Sotillo', 15),
  (204, 'Uracoa', 15),
  (205, 'Antolin del Campo', 16),
  (206, 'Arismendi', 16),
  (207, 'Diaz', 16),
  (208, 'Garcia', 16),
  (209, 'Gomez', 16),
  (210, 'Maneiro', 16),
  (211, 'Marcano', 16),
  (212, 'Marino', 16),
  (213, 'Peninsula de Macanao', 16),
  (214, 'Tubores', 16),
  (215, 'Villalba', 16),
  (216, 'Agua Blanca', 17),
  (217, 'Araure', 17),
  (218, 'Esteller', 17),
  (219, 'Guanare', 17),
  (220, 'Guanarito', 17),
  (221, 'La Palmera', 17),
  (222, 'Ospino', 17),
  (223, 'Papelon', 17),
  (224, 'Piritu', 17),
  (225, 'San Rafael de Onoto', 17),
  (226, 'Santa Rosalía', 17),
  (227, 'Turén', 17),
  (228, 'Andres Bello', 18),
  (229, 'Andres Eloy Blanco', 18),
  (230, 'Crespo', 18),
  (231, 'Libertador', 18),
  (232, 'Marino', 18),
  (233, 'Mejia', 18),
  (234, 'Rivas Davila', 18),
  (235, 'Sucre', 18),
  (236, 'Andres Bello', 19),
  (237, 'Antonio Romulo Costa', 19),
  (238, 'Cardenas', 19),
  (239, 'Colon', 19),
  (240, 'Fernandez Feo', 19),
  (241, 'Jose Maria Vargas', 19),
  (242, 'Junin', 19),
  (243, 'Libertad', 19),
  (244, 'Michelena', 19),
  (245, 'Panamericano', 19),
  (246, 'Pedro Maria Urena', 19),
  (247, 'San Cristobal', 19),
  (248, 'San Judas Tadeo', 19),
  (249, 'Seboruco', 19),
  (250, 'Simon Rodriguez', 19),
  (251, 'Torbes', 19),
  (252, 'Urena', 19),
  (253, 'Andres Bello', 20),
  (254, 'Bocono', 20),
  (255, 'Bolivar', 20),
  (256, 'Carvajal', 20),
  (257, 'Escuque', 20),
  (258, 'Julio Cesar Salas', 20),
  (259, 'Monte Carmelo', 20),
  (260, 'Trujillo', 20),
  (261, 'Valera', 20),
  (262, 'Vargas', 21),
  (263, 'Bastidas', 22),
  (264, 'Bolivar', 22),
  (265, 'Aroa', 22),
  (266, 'Bruzual', 22),
  (267, 'Chivacoa', 22),
  (268, 'Cocorote', 22),
  (269, 'Independencia', 22),
  (270, 'La Trinidad', 22),
  (271, 'Monge', 22),
  (272, 'Nirgua', 22),
  (273, 'Paez', 22),
  (274, 'Pena', 22),
  (275, 'San Felipe', 22),
  (276, 'Sucre', 22),
  (277, 'Urachiche', 22),
  (278, 'Veroes', 22),
  (279, 'Almirante Padilla', 23),
  (280, 'Baralt', 23),
  (281, 'Cabimas', 23),
  (282, 'Colon', 23),
  (283, 'Francisco Javier Pulgar', 23),
  (284, 'Jesus Enrique Lossada', 23),
  (285, 'La Canada de Urdaneta', 23),
  (286, 'Lagunillas', 23),
  (287, 'Maracaibo', 23),
  (288, 'Miranda', 23),
  (289, 'San Francisco', 23),
  (290, 'Santa Rita', 23),
  (291, 'Sucre', 23),
  (292, 'Valmore Rodriguez', 23);

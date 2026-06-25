CREATE TABLE usuarios (
    id           BIGSERIAL PRIMARY KEY,
    nombre       VARCHAR(100)   NOT NULL,
    email        VARCHAR(150)   NOT NULL UNIQUE,
    password     VARCHAR(255)   NOT NULL,
    nivel_actual INTEGER        DEFAULT 1,
    xp_total     INTEGER        DEFAULT 0,
    racha_actual INTEGER        DEFAULT 0,
    mejor_racha  INTEGER        DEFAULT 0,
    ultimo_registro DATE,
    meta_semanal_kg DECIMAL(5,2) DEFAULT 2.0,
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipos_residuo (
    id           BIGSERIAL PRIMARY KEY,
    codigo       VARCHAR(20)    NOT NULL UNIQUE,
    nombre       VARCHAR(50)    NOT NULL,
    factor_co2_kg DECIMAL(6,4)  NOT NULL,
    xp_por_kg    INTEGER        NOT NULL
);

CREATE TABLE niveles (
    id           INTEGER        PRIMARY KEY,
    nombre       VARCHAR(50)    NOT NULL,
    xp_requerido INTEGER        NOT NULL
);

CREATE TABLE insignias (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    icono           VARCHAR(100),
    condicion_tipo  VARCHAR(50),
    condicion_valor DECIMAL(8,2),
    xp_bonus        INTEGER DEFAULT 0
);

CREATE TABLE registros_reciclaje (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT        NOT NULL REFERENCES usuarios(id),
    tipo_residuo_id BIGINT        NOT NULL REFERENCES tipos_residuo(id),
    cantidad_kg     DECIMAL(6,2)  NOT NULL,
    xp_ganado       INTEGER       NOT NULL,
    co2_evitado_kg  DECIMAL(8,4),
    fecha_registro  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insignias_usuario (
    usuario_id         BIGINT NOT NULL REFERENCES usuarios(id),
    insignia_id        BIGINT NOT NULL REFERENCES insignias(id),
    fecha_desbloqueada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, insignia_id)
);

CREATE TABLE conversaciones (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT    NOT NULL REFERENCES usuarios(id),
    rol        VARCHAR(20) NOT NULL,
    contenido  TEXT       NOT NULL,
    created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_usuario_fecha ON registros_reciclaje(usuario_id, fecha_registro);
CREATE INDEX idx_conversaciones_usuario  ON conversaciones(usuario_id, created_at);

-- Tipos de residuo con factores CO2 del MINAM Perú
INSERT INTO tipos_residuo (codigo, nombre, factor_co2_kg, xp_por_kg) VALUES
('PLASTICO',    'Plástico',      1.5000, 100),
('PAPEL',       'Papel/Cartón',  0.9000,  60),
('VIDRIO',      'Vidrio',        0.8000,  50),
('METAL',       'Metal',         2.0000, 150),
('ORGANICO',    'Orgánico',      0.5000,  40),
('ELECTRONICO', 'Electrónico',   5.0000, 400);

-- Niveles y XP requerido
INSERT INTO niveles (id, nombre, xp_requerido) VALUES
(1, 'Reciclador Novato',      0),
(2, 'Aprendiz Verde',       500),
(3, 'Eco Guardián',        1500),
(4, 'Protector del Planeta',3500),
(5, 'Eco Maestro',         7000);

-- Insignias desbloqueables
INSERT INTO insignias (nombre, descripcion, icono, condicion_tipo, condicion_valor, xp_bonus) VALUES
('Primer Paso',         'Registra tu primer residuo',              'first-step',  'PRIMER_REGISTRO',    1,    50),
('Guardián del Plástico','Recicla 5 kg de plástico',               'plastic',     'PLASTICO',           5.0, 200),
('Guardián del Vidrio', 'Recicla 3 kg de vidrio',                  'glass',       'VIDRIO',             3.0, 150),
('Maestro del Papel',   'Recicla 5 kg de papel',                   'paper',       'PAPEL',              5.0, 150),
('Racha de 7 Días',     'Recicla 7 días consecutivos',             'streak-7',    'RACHA',              7.0, 300),
('Racha de 30 Días',    'Recicla 30 días consecutivos',            'streak-30',   'RACHA',             30.0,1000),
('Eco Héroe',           'Evita 10 kg de CO₂',                      'eco-hero',    'CO2_EVITADO',       10.0, 500),
('Reciclador Total',    'Recicla todos los tipos de residuo',       'all-types',   'TODOS_TIPOS',        6.0,1000);

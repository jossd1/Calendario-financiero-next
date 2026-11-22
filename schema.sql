CREATE DATABASE calendario_financiero; 
\connect calendario_financiero --No ejecutes esta linea si lo haces de manera grafica, como en DBeaver.

CREATE TABLE IF NOT EXISTS perfiles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(160) DEFAULT 'Cuenta principal en Soles (S/)',
    moneda VARCHAR(10) DEFAULT 'PEN',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    perfil_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    nombre VARCHAR(60) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    atajo VARCHAR(10) DEFAULT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
    UNIQUE (perfil_id, nombre)
);

CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY,
    perfil_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    categoria VARCHAR(60) NOT NULL,
    descripcion VARCHAR(240) DEFAULT '',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(15) NOT NULL DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'programado')),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presupuestos (
    id SERIAL PRIMARY KEY,
    perfil_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    mes_anio VARCHAR(10) NOT NULL DEFAULT 'BASE',
    categoria VARCHAR(60) NOT NULL,
    limite_monto NUMERIC(12, 2) NOT NULL CHECK (limite_monto >= 0),
    UNIQUE (perfil_id, mes_anio, categoria)
);

CREATE TABLE IF NOT EXISTS ajustes_app (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(60) NOT NULL UNIQUE,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    textos_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transacciones
    ADD COLUMN IF NOT EXISTS eliminado BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE transacciones
    ADD COLUMN IF NOT EXISTS estado VARCHAR(15) NOT NULL DEFAULT 'pagado';

ALTER TABLE categorias
    ADD COLUMN IF NOT EXISTS color VARCHAR(20) NOT NULL DEFAULT '#3b82f6';

CREATE INDEX IF NOT EXISTS idx_tx_perfil_fecha ON transacciones(perfil_id, fecha);
CREATE INDEX IF NOT EXISTS idx_tx_perfil_eliminado ON transacciones(perfil_id, eliminado);
CREATE INDEX IF NOT EXISTS idx_cat_perfil ON categorias(perfil_id);
CREATE INDEX IF NOT EXISTS idx_pres_perfil ON presupuestos(perfil_id, mes_anio);
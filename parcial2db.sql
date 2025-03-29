CREATE DATABASE IF NOT EXISTS parcial2db;
USE parcial2db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar datos de prueba (opcional)
INSERT INTO usuarios (nombre, correo, contrasena) VALUES 
('John doe', 'johndoe@example.com', '123456');

INSERT INTO productos (nombre, descripcion, precio, cantidad, usuario_id) VALUES 
('Producto 1', 'Descripción producto 1', 0.99, 1, 1),
('Producto 2', 'Descripción producto 2', 9.99, 10, 1);
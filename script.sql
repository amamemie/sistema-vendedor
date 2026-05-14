CREATE DATABASE IF NOT EXISTS sistema_ventas;
USE sistema_ventas;

-- [ESTRUCTURA DE TABLAS]

CREATE TABLE CUENTA_USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Vendedor', 'Admin', 'Comprador') NOT NULL,
    estado VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE VENDEDOR (
    id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(150),
    telefono VARCHAR(20),
    fecha_registro DATE,
    estado ENUM('Pendiente', 'Activo'),
    FOREIGN KEY (id_usuario) REFERENCES CUENTA_USUARIO(id_usuario)
);

CREATE TABLE PERFIL_VENDEDOR (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT UNIQUE,
    tipo_persona ENUM('Natural', 'Juridica'),
    documento_identidad VARCHAR(50),
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    estado_validacion ENUM('Pendiente', 'Aprobado', 'Rechazado'),
    fecha_validacion DATETIME,
    FOREIGN KEY (id_vendedor) REFERENCES VENDEDOR(id_vendedor)
);

CREATE TABLE DOCUMENTO (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_perfil INT,
    tipo_documento VARCHAR(100),
    archivo_url VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Aprobado', 'Rechazado'),
    FOREIGN KEY (id_perfil) REFERENCES PERFIL_VENDEDOR(id_perfil)
);

CREATE TABLE TIENDA (
    id_tienda INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT,
    id_usuario_admin INT,
    nombre_tienda VARCHAR(150),
    descripcion TEXT,
    logo_url VARCHAR(255),
    estado ENUM('Activa', 'Desactivada'),
    fecha_creacion DATE,
    FOREIGN KEY (id_vendedor) REFERENCES VENDEDOR(id_vendedor),
    FOREIGN KEY (id_usuario_admin) REFERENCES CUENTA_USUARIO(id_usuario)
);

CREATE TABLE CATEGORIA (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    detalle TEXT,
    estado VARCHAR(50)
);

CREATE TABLE UBICACION (
    id_confirmacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    detalle TEXT,
    estado VARCHAR(50)
);

CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_tienda INT,
    id_categoria INT,
    id_ubicacion INT,
    nombre VARCHAR(150),
    descripcion TEXT,
    precio_unitario DECIMAL(10,2),
    estado ENUM('Activo', 'Inactivo'),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tienda) REFERENCES TIENDA(id_tienda),
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria),
    FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_confirmacion)
);

CREATE TABLE INVENTARIO (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT UNIQUE,
    stock_actual INT,
    stock_minimo INT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE COMPRADOR (
    id_comprador INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(150),
    telefono VARCHAR(20),
    FOREIGN KEY (id_usuario) REFERENCES CUENTA_USUARIO(id_usuario)
);

CREATE TABLE COMPRA (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_comprador INT,
    id_tienda INT,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Pagada', 'Cancelada'),
    FOREIGN KEY (id_comprador) REFERENCES COMPRADOR(id_comprador),
    FOREIGN KEY (id_tienda) REFERENCES TIENDA(id_tienda)
);

CREATE TABLE DETALLE_COMPRA (
    id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT,
    id_producto INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE PAGO (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT UNIQUE,
    metodo_pago ENUM('Tarjeta', 'Transferencia', 'QR'),
    estado ENUM('Pendiente', 'Exitoso', 'Fallido'),
    monto_total DECIMAL(10,2),
    fecha_pago DATETIME,
    referencia_transaccion VARCHAR(100),
    FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra)
);

CREATE TABLE COMISION (
    id_comision INT AUTO_INCREMENT PRIMARY KEY,
    id_pago INT,
    porcentaje DECIMAL(5,2) DEFAULT 3.00,
    monto DECIMAL(10,2),
    FOREIGN KEY (id_pago) REFERENCES PAGO(id_pago)
);

CREATE TABLE DISPERSION (
    id_dispersion INT AUTO_INCREMENT PRIMARY KEY,
    id_comision INT,
    id_vendedor INT,
    porcentaje DECIMAL(5,2) DEFAULT 97.00,
    monto DECIMAL(10,2),
    fecha_dispersion DATETIME,
    estado ENUM('Pendiente', 'Enviada'),
    FOREIGN KEY (id_comision) REFERENCES COMISION(id_comision),
    FOREIGN KEY (id_vendedor) REFERENCES VENDEDOR(id_vendedor)
);

-- [INSERCIÓN DE DATOS DE PRUEBA]

-- 1. Usuarios (1 Admin, 2 Vendedores, 2 Compradores)
INSERT INTO CUENTA_USUARIO (email, password_hash, rol, estado) VALUES
('admin@sistema.com', 'hash_admin_123', 'Admin', 'Activo'),
('vendedor1@gmail.com', 'hash_vend_1', 'Vendedor', 'Activo'),
('vendedor2@gmail.com', 'hash_vend_2', 'Vendedor', 'Activo'),
('comprador1@hotmail.com', 'hash_comp_1', 'Comprador', 'Activo'),
('comprador2@gmail.com', 'hash_comp_2', 'Comprador', 'Activo');

-- 2. Vendedores
INSERT INTO VENDEDOR (id_usuario, nombres, apellidos, email, telefono, fecha_registro, estado) VALUES
(2, 'Juan', 'Perez', 'vendedor1@gmail.com', '555-0101', '2026-01-10', 'Activo'),
(3, 'Maria', 'Garcia', 'vendedor2@gmail.com', '555-0202', '2026-02-15', 'Activo');

-- 3. Perfiles de Vendedor
INSERT INTO PERFIL_VENDEDOR (id_vendedor, tipo_persona, documento_identidad, direccion, ciudad, pais, estado_validacion) VALUES
(1, 'Natural', 'ID-998877', 'Av. Siempreviva 123', 'La Paz', 'Bolivia', 'Aprobado'),
(2, 'Juridica', 'NIT-112233', 'Calle Comercio 456', 'Santa Cruz', 'Bolivia', 'Aprobado');

-- 4. Documentos
INSERT INTO DOCUMENTO (id_perfil, tipo_documento, archivo_url, estado) VALUES
(1, 'Cedula Identidad', 'https://storage.com/docs/id1.pdf', 'Aprobado'),
(2, 'Registro Mercantil', 'https://storage.com/docs/reg2.pdf', 'Aprobado');

-- 5. Tiendas (Gestionadas por el Admin id_usuario 1)
INSERT INTO TIENDA (id_vendedor, id_usuario_admin, nombre_tienda, descripcion, estado, fecha_creacion) VALUES
(1, 1, 'TecnoMundo', 'Venta de gadgets tecnológicos', 'Activa', '2026-01-12'),
(2, 1, 'ModaExpress', 'Ropa casual y formal', 'Activa', '2026-02-20');

-- 6. Categorías y Ubicaciones
INSERT INTO CATEGORIA (nombre, detalle, estado) VALUES 
('Electrónica', 'Dispositivos y accesorios', 'Activo'),
('Ropa', 'Vestimenta general', 'Activo');

INSERT INTO UBICACION (nombre, detalle, estado) VALUES 
('Almacén Central', 'Pasillo A - Estante 1', 'Disponible'),
('Bodega Norte', 'Sector Ropa', 'Disponible');

-- 7. Productos e Inventario
INSERT INTO PRODUCTO (id_tienda, id_categoria, id_ubicacion, nombre, precio_unitario, estado) VALUES
(1, 1, 1, 'Smartphone X1', 500.00, 'Activo'),
(1, 1, 1, 'Audífonos Bluetooth', 50.00, 'Activo'),
(2, 2, 2, 'Camisa de Lino', 35.00, 'Activo');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo) VALUES
(1, 20, 5),
(2, 50, 10),
(3, 100, 15);

-- 8. Compradores
INSERT INTO COMPRADOR (id_usuario, nombres, apellidos, email, telefono) VALUES
(4, 'Carlos', 'Lopez', 'comprador1@hotmail.com', '555-9988'),
(5, 'Ana', 'Torres', 'comprador2@gmail.com', '555-7766');

-- 9. Flujo de una Compra (Ejemplo Completo)
-- Compra de Carlos en TecnoMundo
INSERT INTO COMPRA (id_comprador, id_tienda, estado) VALUES (1, 1, 'Pagada');

-- Detalle: 1 Smartphone (500) + 2 Audífonos (100) = 600 total
INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(1, 1, 1, 500.00, 500.00),
(1, 2, 2, 50.00, 100.00);

-- Pago 
INSERT INTO PAGO (id_compra, metodo_pago, estado, monto_total, fecha_pago, referencia_transaccion) VALUES
(1, 'Tarjeta', 'Exitoso', 600.00, '2026-05-03 10:00:00', 'TRANS-998877');

-- Comisión (3% de 600 = 18)
INSERT INTO COMISION (id_pago, porcentaje, monto) VALUES (1, 3.00, 18.00);

-- Dispersión al Vendedor 1 (97% de 600 = 582)
INSERT INTO DISPERSION (id_comision, id_vendedor, porcentaje, monto, fecha_dispersion, estado) VALUES
(1, 1, 97.00, 582.00, '2026-05-03 12:00:00', 'Enviada');
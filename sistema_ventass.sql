-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-05-2026 a las 20:04:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_ventass`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `detalle` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `detalle`, `estado`) VALUES
(1, 'Electrónica', 'Dispositivos y accesorios', 'Activo'),
(2, 'Ropa', 'Vestimenta general', 'Activo'),
(3, 'Accesorios', '', 'Activo'),
(4, 'plantas ', 'productor de verduras para decorados', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comision`
--

CREATE TABLE `comision` (
  `id_comision` int(11) NOT NULL,
  `id_pago` int(11) DEFAULT NULL,
  `porcentaje` decimal(5,2) DEFAULT 3.00,
  `monto` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comision`
--

INSERT INTO `comision` (`id_comision`, `id_pago`, `porcentaje`, `monto`) VALUES
(1, 1, 3.00, 18.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id_compra` int(11) NOT NULL,
  `id_comprador` int(11) DEFAULT NULL,
  `id_tienda` int(11) DEFAULT NULL,
  `fecha_compra` datetime DEFAULT current_timestamp(),
  `estado` enum('Pendiente','Pagada','Cancelada') DEFAULT NULL,
  `total_bruto` decimal(10,2) DEFAULT 0.00,
  `solicita_devolucion` enum('Pendiente','Aprobado','Rechazado') DEFAULT NULL,
  `devolucion_motivo` varchar(500) DEFAULT NULL,
  `devolucion_fecha_solicitud` datetime DEFAULT NULL,
  `devolucion_fecha_respuesta` datetime DEFAULT NULL,
  `devolucion_monto_reembolso` decimal(10,2) DEFAULT NULL,
  `cancelada` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compra`
--

INSERT INTO `compra` (`id_compra`, `id_comprador`, `id_tienda`, `fecha_compra`, `estado`, `total_bruto`, `solicita_devolucion`, `devolucion_motivo`, `devolucion_fecha_solicitud`, `devolucion_fecha_respuesta`, `devolucion_monto_reembolso`, `cancelada`) VALUES
(1, 1, 1, '2026-05-15 20:06:33', 'Pagada', 0.00, 'Aprobado', 'no hay dienro', '2026-05-18 00:48:08', NULL, NULL, 0),
(2, 1, 3, '2026-05-18 04:56:21', '', 0.17, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprador`
--

CREATE TABLE `comprador` (
  `id_comprador` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `nombres` varchar(100) DEFAULT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comprador`
--

INSERT INTO `comprador` (`id_comprador`, `id_usuario`, `nombres`, `apellidos`, `email`, `telefono`) VALUES
(1, 4, 'Carlos', 'Lopez', 'comprador1@hotmail.com', '555-9988'),
(2, 5, 'Ana', 'Torres', 'comprador2@gmail.com', '555-7766'),
(3, 6, 'ector', 'caaa', 'coster@gmail.com', '123456'),
(4, 7, 'nuevo', 'pot', 'bien@gmail.com', '123456');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_usuario`
--

CREATE TABLE `cuenta_usuario` (
  `id_usuario` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('Vendedor','Admin','Comprador') NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuenta_usuario`
--

INSERT INTO `cuenta_usuario` (`id_usuario`, `email`, `password_hash`, `rol`, `estado`, `fecha_creacion`) VALUES
(1, 'admin@sistema.com', 'hash_admin_123', 'Admin', 'Activo', '2026-05-16 00:06:32'),
(2, 'vendedor1@gmail.com', 'hash_vend_1', 'Vendedor', 'Activo', '2026-05-16 00:06:32'),
(3, 'vendedor2@gmail.com', 'hash_vend_2', 'Vendedor', 'Activo', '2026-05-16 00:06:32'),
(4, 'comprador1@hotmail.com', 'hash_comp_1', 'Comprador', 'Activo', '2026-05-16 00:06:32'),
(5, 'comprador2@gmail.com', 'hash_comp_2', 'Vendedor', 'Activo', '2026-05-16 00:06:32'),
(6, 'coster@gmail.com', '123456', 'Vendedor', 'Activo', '2026-05-16 01:42:36'),
(7, 'bien@gmail.com', '123456', 'Comprador', 'Activo', '2026-05-16 06:15:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compra`
--

CREATE TABLE `detalle_compra` (
  `id_detalle_compra` int(11) NOT NULL,
  `id_compra` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `devuelto` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_compra`
--

INSERT INTO `detalle_compra` (`id_detalle_compra`, `id_compra`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`, `devuelto`) VALUES
(1, 1, 1, 1, 500.00, 500.00, 0),
(2, 1, 2, 2, 50.00, 100.00, 0),
(3, 2, 14, 1, 0.17, 0.17, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dispersion`
--

CREATE TABLE `dispersion` (
  `id_dispersion` int(11) NOT NULL,
  `id_comision` int(11) DEFAULT NULL,
  `id_vendedor` int(11) DEFAULT NULL,
  `porcentaje` decimal(5,2) DEFAULT 97.00,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha_dispersion` datetime DEFAULT NULL,
  `estado` enum('Pendiente','Enviada') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dispersion`
--

INSERT INTO `dispersion` (`id_dispersion`, `id_comision`, `id_vendedor`, `porcentaje`, `monto`, `fecha_dispersion`, `estado`) VALUES
(1, 1, 1, 97.00, 582.00, '2026-05-03 12:00:00', 'Enviada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento`
--

CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL,
  `id_perfil` int(11) DEFAULT NULL,
  `tipo_documento` varchar(100) DEFAULT NULL,
  `archivo_url` varchar(255) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('Pendiente','Aprobado','Rechazado') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documento`
--

INSERT INTO `documento` (`id_documento`, `id_perfil`, `tipo_documento`, `archivo_url`, `fecha_subida`, `estado`) VALUES
(1, 1, 'Cedula Identidad', 'https://storage.com/docs/id1.pdf', '2026-05-16 00:06:33', 'Aprobado'),
(2, 2, 'Registro Mercantil', 'https://storage.com/docs/reg2.pdf', '2026-05-16 00:06:33', 'Aprobado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `stock_actual` int(11) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_inventario`, `id_producto`, `stock_actual`, `stock_minimo`, `fecha_actualizacion`) VALUES
(1, 1, 20, 5, '2026-05-16 00:06:33'),
(2, 2, 50, 10, '2026-05-16 00:06:33'),
(3, 3, 100, 15, '2026-05-16 00:06:33'),
(8, 5, 15, 5, '2026-05-16 01:58:55'),
(9, 6, 40, 10, '2026-05-16 01:58:55'),
(19, 11, 3, 5, '2026-05-18 04:51:57'),
(20, 12, 18, 5, '2026-05-17 04:23:19'),
(21, 13, 10, 5, '2026-05-18 05:19:41'),
(22, 14, 29, 5, '2026-05-18 07:00:58'),
(23, 15, 39, 5, '2026-05-18 09:32:34'),
(24, 16, 23, 5, '2026-05-18 09:33:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_compra` int(11) DEFAULT NULL,
  `metodo_pago` enum('Tarjeta','Transferencia','QR') DEFAULT NULL,
  `estado` enum('Pendiente','Exitoso','Fallido') DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `referencia_transaccion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `id_compra`, `metodo_pago`, `estado`, `monto_total`, `fecha_pago`, `referencia_transaccion`) VALUES
(1, 1, 'Tarjeta', 'Exitoso', 600.00, '2026-05-03 10:00:00', 'TRANS-998877');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_vendedor`
--

CREATE TABLE `perfil_vendedor` (
  `id_perfil` int(11) NOT NULL,
  `id_vendedor` int(11) DEFAULT NULL,
  `tipo_persona` enum('Natural','Juridica') DEFAULT NULL,
  `documento_identidad` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `estado_validacion` enum('Pendiente','Aprobado','Rechazado') DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `perfil_vendedor`
--

INSERT INTO `perfil_vendedor` (`id_perfil`, `id_vendedor`, `tipo_persona`, `documento_identidad`, `direccion`, `ciudad`, `pais`, `estado_validacion`, `fecha_validacion`) VALUES
(1, 1, 'Natural', 'ID-998877', 'Av. Siempreviva 123', 'La Paz', 'Bolivia', 'Aprobado', NULL),
(2, 2, 'Juridica', 'NIT-112233', 'Calle Comercio 456', 'Santa Cruz', 'Bolivia', 'Aprobado', NULL),
(3, 3, 'Juridica', '5165', 'C.C7 Nº 131', '', NULL, 'Aprobado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `id_tienda` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_ubicacion` int(11) DEFAULT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `imagen_principal` varchar(500) DEFAULT NULL,
  `imagenes_extra` text DEFAULT NULL,
  `calificacion_promedio` decimal(2,1) DEFAULT 0.0,
  `estado_admin` enum('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  `rechazo_motivo` varchar(255) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `id_tienda`, `id_categoria`, `id_ubicacion`, `nombre`, `descripcion`, `precio_unitario`, `estado`, `fecha_creacion`, `imagen_principal`, `imagenes_extra`, `calificacion_promedio`, `estado_admin`, `rechazo_motivo`, `fecha_aprobacion`) VALUES
(1, 1, 1, 1, 'Smartphone X1', NULL, 500.00, 'Activo', '2026-05-16 00:06:33', 'uploads/productos/smartphone.jpg', NULL, NULL, 'Aprobado', NULL, '2026-05-18 01:49:58'),
(2, 1, 1, 1, 'Audífonos Bluetooth', NULL, 50.00, 'Activo', '2026-05-16 00:06:33', 'uploads/productos/audifonos.jpg', NULL, 4.2, 'Aprobado', NULL, '2026-05-18 01:50:03'),
(3, 2, 2, 2, 'Camisa de Lino', NULL, 35.00, 'Activo', '2026-05-16 00:06:33', 'uploads/productos/camisa.jpg', NULL, 3.0, 'Aprobado', NULL, '2026-05-18 01:50:07'),
(5, 1, 1, 1, 'Tablet Pro', 'Tablet de 10 pulgadas con lápiz incluido', 299.99, 'Activo', '2026-05-16 01:58:55', 'uploads/productos/tablet.jpg', NULL, 4.7, 'Aprobado', NULL, '2026-05-18 01:50:09'),
(6, 2, 2, 1, 'Zapatillas Deportivas', 'Zapatillas para correr talla 42', 89.99, 'Activo', '2026-05-16 01:58:55', 'uploads/productos/zapatillas.jpg', NULL, 4.3, 'Aprobado', NULL, '2026-05-18 02:23:50'),
(7, 1, 1, 1, 'Smartphone X1', 'Teléfono inteligente de última generación', 499.99, 'Activo', '2026-05-16 02:42:24', 'uploads/productos/smartphone.jpg', NULL, 4.5, 'Aprobado', NULL, '2026-05-18 05:20:36'),
(8, 1, 1, 1, 'Audífonos Bluetooth', 'Audífonos inalámbricos', 59.99, 'Activo', '2026-05-16 02:42:24', 'uploads/productos/audifonos.jpg', NULL, 4.2, 'Aprobado', NULL, '2026-05-18 05:20:38'),
(9, 2, 2, 1, 'Camisa de Lino', 'Camisa de vestir de lino', 35.00, 'Activo', '2026-05-16 02:42:24', 'uploads/productos/camisa.jpg', NULL, 4.8, 'Aprobado', NULL, '2026-05-18 05:20:39'),
(10, 2, 3, 1, 'Mochila Canvas', 'Mochila resistente para laptop', 45.00, 'Activo', '2026-05-16 02:42:24', 'uploads/productos/mochila.jpg', NULL, 4.0, 'Aprobado', NULL, '2026-05-18 05:20:41'),
(11, 1, 3, 1, 'presentacion', 'tabla', 0.03, 'Activo', '2026-05-16 07:55:31', NULL, 'uploads/productos/prod_11_6a0822f3a02db.png,uploads/productos/prod_11_6a08230785a2e.png', 0.0, 'Aprobado', NULL, '2026-05-18 05:20:42'),
(12, 3, 3, 1, 'cade', '', 0.03, 'Activo', '2026-05-17 04:23:19', NULL, 'uploads/productos/prod_12_6a0942b76db6c.png', 0.0, 'Aprobado', NULL, '2026-05-18 02:27:11'),
(13, 1, 3, 1, 'carbonita', 'para todo uso ', 0.06, 'Activo', '2026-05-18 05:19:41', NULL, NULL, 0.0, 'Aprobado', NULL, '2026-05-18 05:20:44'),
(14, 3, 1, 1, 'presentacion', 'priiiiiiiii', 0.17, 'Activo', '2026-05-18 07:00:58', 'uploads/productos/prod_14_6a0ab92ae4848.jpg', NULL, 0.0, 'Aprobado', NULL, '2026-05-18 03:01:50'),
(15, 3, 3, 1, 'ddd', 'compr', 0.16, 'Activo', '2026-05-18 09:32:34', 'uploads/productos/prod_15_6a0adcb30324e.jpg', NULL, 0.0, 'Aprobado', NULL, '2026-05-18 05:33:39'),
(16, 3, 4, 1, 'pantalll', 'pantalla en forma de planta', 0.23, 'Activo', '2026-05-18 09:33:15', 'uploads/productos/prod_16_6a0adcdb68815.jpg', NULL, 0.0, 'Aprobado', NULL, '2026-05-18 06:01:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_producto`
--

CREATE TABLE `reporte_producto` (
  `id_reporte` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `motivo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Pendiente',
  `fecha_reporte` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reporte_producto`
--

INSERT INTO `reporte_producto` (`id_reporte`, `id_producto`, `motivo`, `descripcion`, `estado`, `fecha_reporte`) VALUES
(1, 1, 'Producto prohibido o ilegal', '', 'Pendiente', '2026-05-16 08:36:54'),
(2, 1, 'Producto dañado o defectuoso', '', 'Pendiente', '2026-05-16 08:55:52'),
(3, 1, 'Producto dañado o defectuoso', '', 'Pendiente', '2026-05-16 08:55:53'),
(4, 1, 'Producto dañado o defectuoso', '', 'Pendiente', '2026-05-16 08:56:00'),
(5, 1, 'Producto dañado o defectuoso', '', 'Pendiente', '2026-05-16 08:56:02'),
(6, 3, 'Producto falsificado', '', 'Pendiente', '2026-05-17 01:00:20'),
(7, 3, 'Producto falsificado', '', 'Pendiente', '2026-05-17 01:00:29'),
(8, 1, 'Publicidad engañosa', 'mal estado', 'Pendiente', '2026-05-17 01:01:14'),
(9, 2, 'Producto prohibido o ilegal', '', 'Pendiente', '2026-05-17 02:52:38'),
(10, 2, 'Publicidad engañosa', 'rrrrrer', 'Pendiente', '2026-05-17 02:52:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id_resena` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `calificacion` int(11) DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `tipo` enum('reseña','chat') DEFAULT 'reseña',
  `mensaje` text DEFAULT NULL,
  `emisor` enum('comprador','vendedor') DEFAULT NULL,
  `leido` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id_resena`, `id_producto`, `id_usuario`, `calificacion`, `comentario`, `fecha`, `tipo`, `mensaje`, `emisor`, `leido`) VALUES
(1, 3, 4, 3, 'vend', '2026-05-18 00:17:05', 'reseña', NULL, NULL, 0),
(11, 14, 1, NULL, NULL, '2026-05-18 04:42:30', 'chat', 'erw', 'comprador', 0),
(12, 14, 1, NULL, NULL, '2026-05-18 04:42:50', 'chat', 'werew', 'comprador', 0),
(13, 14, 1, NULL, NULL, '2026-05-18 04:46:55', 'chat', 'hola', 'comprador', 0),
(14, 14, 2, NULL, NULL, '2026-05-18 04:54:13', 'chat', 'Hola comprador, soy el vendedor', 'vendedor', 0),
(15, 14, 1, NULL, NULL, '2026-05-18 04:58:13', 'chat', 'hola', 'vendedor', 0),
(16, 14, 1, NULL, NULL, '2026-05-18 04:58:33', 'chat', 'quiero un kase', 'comprador', 0),
(17, 14, 1, NULL, NULL, '2026-05-18 04:58:41', 'chat', 'okey pene', 'vendedor', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tienda`
--

CREATE TABLE `tienda` (
  `id_tienda` int(11) NOT NULL,
  `id_vendedor` int(11) DEFAULT NULL,
  `id_usuario_admin` int(11) DEFAULT NULL,
  `nombre_tienda` varchar(150) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `estado` enum('Activa','Desactivada') DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tienda`
--

INSERT INTO `tienda` (`id_tienda`, `id_vendedor`, `id_usuario_admin`, `nombre_tienda`, `descripcion`, `logo_url`, `estado`, `fecha_creacion`) VALUES
(1, 1, 1, 'TecnoMundo', 'Venta de gadgets tecnológicos', NULL, 'Activa', '2026-01-12'),
(2, 2, 1, 'ModaExpress', 'Ropa casual y formal', NULL, 'Activa', '2026-02-20'),
(3, 3, NULL, 'Mi Empresa Test', 'C.C7 Nº 131', NULL, 'Activa', '2026-05-16'),
(4, 3, 1, 'Mi Tienda', 'Tienda de productos varios', NULL, 'Activa', '2026-05-18'),
(5, 3, 1, 'Tienda de Coster', 'Productos varios', NULL, 'Activa', '2026-05-18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion`
--

CREATE TABLE `ubicacion` (
  `id_confirmacion` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `detalle` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicacion`
--

INSERT INTO `ubicacion` (`id_confirmacion`, `nombre`, `detalle`, `estado`) VALUES
(1, 'Almacén Central', 'Pasillo A - Estante 1', 'Disponible'),
(2, 'Bodega Norte', 'Sector Ropa', 'Disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vendedor`
--

CREATE TABLE `vendedor` (
  `id_vendedor` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `nombres` varchar(100) DEFAULT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `estado` enum('Pendiente','Activo','Rechazado') DEFAULT 'Pendiente',
  `calificacion_promedio` decimal(2,1) DEFAULT 0.0,
  `total_resenas` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vendedor`
--

INSERT INTO `vendedor` (`id_vendedor`, `id_usuario`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_registro`, `estado`, `calificacion_promedio`, `total_resenas`) VALUES
(1, 2, 'Juan', 'Perez', 'vendedor1@gmail.com', '555-0101', '2026-01-10', 'Activo', NULL, 0),
(2, 3, 'Maria', 'Garcia', 'vendedor2@gmail.com', '555-0202', '2026-02-15', 'Activo', 3.0, 1),
(3, 6, '', '', '', '5555555577', NULL, 'Activo', 0.0, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `comision`
--
ALTER TABLE `comision`
  ADD PRIMARY KEY (`id_comision`),
  ADD KEY `id_pago` (`id_pago`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `id_comprador` (`id_comprador`),
  ADD KEY `id_tienda` (`id_tienda`);

--
-- Indices de la tabla `comprador`
--
ALTER TABLE `comprador`
  ADD PRIMARY KEY (`id_comprador`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `cuenta_usuario`
--
ALTER TABLE `cuenta_usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD PRIMARY KEY (`id_detalle_compra`),
  ADD KEY `id_compra` (`id_compra`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `dispersion`
--
ALTER TABLE `dispersion`
  ADD PRIMARY KEY (`id_dispersion`),
  ADD KEY `id_comision` (`id_comision`),
  ADD KEY `id_vendedor` (`id_vendedor`);

--
-- Indices de la tabla `documento`
--
ALTER TABLE `documento`
  ADD PRIMARY KEY (`id_documento`),
  ADD KEY `id_perfil` (`id_perfil`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD UNIQUE KEY `id_compra` (`id_compra`);

--
-- Indices de la tabla `perfil_vendedor`
--
ALTER TABLE `perfil_vendedor`
  ADD PRIMARY KEY (`id_perfil`),
  ADD UNIQUE KEY `id_vendedor` (`id_vendedor`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_tienda` (`id_tienda`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_ubicacion` (`id_ubicacion`);

--
-- Indices de la tabla `reporte_producto`
--
ALTER TABLE `reporte_producto`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id_resena`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `resena_ibfk_2` (`id_usuario`);

--
-- Indices de la tabla `tienda`
--
ALTER TABLE `tienda`
  ADD PRIMARY KEY (`id_tienda`),
  ADD KEY `id_vendedor` (`id_vendedor`),
  ADD KEY `id_usuario_admin` (`id_usuario_admin`);

--
-- Indices de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`id_confirmacion`);

--
-- Indices de la tabla `vendedor`
--
ALTER TABLE `vendedor`
  ADD PRIMARY KEY (`id_vendedor`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `comision`
--
ALTER TABLE `comision`
  MODIFY `id_comision` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `comprador`
--
ALTER TABLE `comprador`
  MODIFY `id_comprador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cuenta_usuario`
--
ALTER TABLE `cuenta_usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  MODIFY `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `dispersion`
--
ALTER TABLE `dispersion`
  MODIFY `id_dispersion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `documento`
--
ALTER TABLE `documento`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `perfil_vendedor`
--
ALTER TABLE `perfil_vendedor`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `reporte_producto`
--
ALTER TABLE `reporte_producto`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id_resena` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `tienda`
--
ALTER TABLE `tienda`
  MODIFY `id_tienda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `id_confirmacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `vendedor`
--
ALTER TABLE `vendedor`
  MODIFY `id_vendedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comision`
--
ALTER TABLE `comision`
  ADD CONSTRAINT `comision_ibfk_1` FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`);

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_comprador`) REFERENCES `comprador` (`id_comprador`),
  ADD CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_tienda`) REFERENCES `tienda` (`id_tienda`);

--
-- Filtros para la tabla `comprador`
--
ALTER TABLE `comprador`
  ADD CONSTRAINT `comprador_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cuenta_usuario` (`id_usuario`);

--
-- Filtros para la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  ADD CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `dispersion`
--
ALTER TABLE `dispersion`
  ADD CONSTRAINT `dispersion_ibfk_1` FOREIGN KEY (`id_comision`) REFERENCES `comision` (`id_comision`),
  ADD CONSTRAINT `dispersion_ibfk_2` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor` (`id_vendedor`);

--
-- Filtros para la tabla `documento`
--
ALTER TABLE `documento`
  ADD CONSTRAINT `documento_ibfk_1` FOREIGN KEY (`id_perfil`) REFERENCES `perfil_vendedor` (`id_perfil`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`);

--
-- Filtros para la tabla `perfil_vendedor`
--
ALTER TABLE `perfil_vendedor`
  ADD CONSTRAINT `perfil_vendedor_ibfk_1` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor` (`id_vendedor`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_tienda`) REFERENCES `tienda` (`id_tienda`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `producto_ibfk_3` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_confirmacion`);

--
-- Filtros para la tabla `reporte_producto`
--
ALTER TABLE `reporte_producto`
  ADD CONSTRAINT `reporte_producto_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `resena_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `resena_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `cuenta_usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tienda`
--
ALTER TABLE `tienda`
  ADD CONSTRAINT `tienda_ibfk_1` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor` (`id_vendedor`),
  ADD CONSTRAINT `tienda_ibfk_2` FOREIGN KEY (`id_usuario_admin`) REFERENCES `cuenta_usuario` (`id_usuario`);

--
-- Filtros para la tabla `vendedor`
--
ALTER TABLE `vendedor`
  ADD CONSTRAINT `vendedor_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cuenta_usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

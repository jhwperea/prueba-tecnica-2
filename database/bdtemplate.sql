-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 28-07-2026 a las 23:42:14
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `taller_pavas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_bikes`
--

CREATE TABLE `tbl_bikes` (
  `bik_id` int(11) NOT NULL,
  `bik_plate` varchar(20) NOT NULL,
  `bik_brand` varchar(100) NOT NULL,
  `bik_model` varchar(100) NOT NULL,
  `bik_cylinder` varchar(20) DEFAULT NULL,
  `cli_id` int(11) NOT NULL,
  `sta_id` int(11) DEFAULT 1,
  `bik_create_by` int(11) DEFAULT NULL,
  `bik_create_at` timestamp NULL DEFAULT current_timestamp(),
  `bik_update_by` int(11) DEFAULT NULL,
  `bik_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_bikes`
--

INSERT INTO `tbl_bikes` (`bik_id`, `bik_plate`, `bik_brand`, `bik_model`, `bik_cylinder`, `cli_id`, `sta_id`, `bik_create_by`, `bik_create_at`, `bik_update_by`, `bik_update_at`) VALUES
(1, 'XYZ123', 'Yamaha', 'MT-03', '321', 1, 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(2, 'ABC987', 'Honda', 'CB 190R', '184', 2, 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(3, 'KLR456', 'Kawasaki', 'KLR 650', '652', 3, 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(4, 'NMAX01', 'Yamaha', 'NMAX 155', '155', 1, 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(5, 'UWO32E', 'YAMAHA', 'FZ25 - 2018', '250', 4, 1, 1, '2026-07-28 21:37:24', 1, '2026-07-28 21:37:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_clients`
--

CREATE TABLE `tbl_clients` (
  `cli_id` int(11) NOT NULL,
  `cli_name` varchar(150) NOT NULL,
  `cli_phone` varchar(30) NOT NULL,
  `cli_email` varchar(150) DEFAULT NULL,
  `sta_id` int(11) DEFAULT 1,
  `cli_create_by` int(11) DEFAULT NULL,
  `cli_create_at` timestamp NULL DEFAULT current_timestamp(),
  `cli_update_by` int(11) DEFAULT NULL,
  `cli_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_clients`
--

INSERT INTO `tbl_clients` (`cli_id`, `cli_name`, `cli_phone`, `cli_email`, `sta_id`, `cli_create_by`, `cli_create_at`, `cli_update_by`, `cli_update_at`) VALUES
(1, 'Carlos Andrés Pérez', '3001234567', 'carlos.perez@gmail.com', 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(2, 'María Fernanda Gómez', '3109876543', 'maria.gomez@hotmail.com', 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(3, 'Taller Distribuciones SAS', '3205551122', 'contacto@distribuciones.com', 1, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(4, 'Jhonier Perea', '3013127037', 'jhwperea@gmail.com', 1, 1, '2026-07-28 21:37:24', 1, '2026-07-28 21:37:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_documents`
--

CREATE TABLE `tbl_documents` (
  `doc_id` int(11) NOT NULL,
  `doc_type` enum('USERS','PROFILES','PAGINAS','PERMISOS') NOT NULL,
  `doc_id_ref` int(11) NOT NULL COMMENT 'ID DE LA TABLA REFERENCIADA',
  `doc_name` varchar(255) DEFAULT NULL,
  `doc_path_storage` varchar(255) NOT NULL,
  `doc_url` varchar(255) NOT NULL,
  `doc_extension` varchar(10) NOT NULL,
  `doc_mime_type` varchar(100) NOT NULL,
  `doc_size` int(11) NOT NULL,
  `doc_parent_id` int(11) DEFAULT NULL,
  `sta_id` int(11) DEFAULT 1,
  `doc_create_by` int(11) DEFAULT NULL,
  `doc_create_at` timestamp NULL DEFAULT current_timestamp(),
  `doc_update_by` int(11) DEFAULT NULL,
  `doc_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_notifications`
--

CREATE TABLE `tbl_notifications` (
  `not_id` int(11) NOT NULL,
  `use_id` int(11) NOT NULL COMMENT 'FK a tbl_users',
  `not_priority` varchar(50) DEFAULT 'medium',
  `not_title` varchar(150) NOT NULL,
  `not_message` text NOT NULL,
  `not_type` varchar(50) DEFAULT 'info',
  `not_module` varchar(100) DEFAULT NULL,
  `not_action` varchar(100) DEFAULT NULL,
  `not_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`not_data`)),
  `not_created_at` timestamp NULL DEFAULT current_timestamp(),
  `not_is_read` tinyint(1) DEFAULT 0,
  `not_read_at` timestamp NULL DEFAULT NULL,
  `not_updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_pages`
--

CREATE TABLE `tbl_pages` (
  `pag_id` int(11) NOT NULL,
  `pag_description` varchar(255) NOT NULL,
  `pag_parent` int(11) DEFAULT NULL,
  `pag_url` varchar(255) DEFAULT NULL,
  `pag_icon` varchar(255) DEFAULT NULL,
  `pag_order` int(11) DEFAULT NULL,
  `pag_name` varchar(255) DEFAULT NULL,
  `pag_type` int(11) DEFAULT NULL COMMENT '1 PADRE,  2 HIJO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_pages`
--

INSERT INTO `tbl_pages` (`pag_id`, `pag_description`, `pag_parent`, `pag_url`, `pag_icon`, `pag_order`, `pag_name`, `pag_type`) VALUES
(1, 'Seguridad', 0, NULL, 'IconShield', 1, 'security', 1),
(2, 'Perfiles', 1, '/security/profiles', 'IconId', 1, 'profiles', 2),
(3, 'Usuarios', 1, '/security/users', 'IconUsers', 2, 'users', 2),
(4, 'Taller', 0, NULL, 'IconTool', 2, 'taller', 1),
(5, 'Clientes', 4, '/taller/clients', 'IconUserCircle', 1, 'clients', 2),
(6, 'Motos', 4, '/taller/bikes', 'IconMotorbike', 2, 'bikes', 2),
(7, 'Órdenes de Trabajo', 4, '/taller/work-orders', 'IconClipboardList', 3, 'workOrders', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_page_permissions`
--

CREATE TABLE `tbl_page_permissions` (
  `pap_id` int(11) NOT NULL,
  `pro_id` int(11) DEFAULT NULL,
  `pag_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_page_permissions`
--

INSERT INTO `tbl_page_permissions` (`pap_id`, `pro_id`, `pag_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6),
(7, 1, 7),
(8, 2, 4),
(9, 2, 5),
(10, 2, 6),
(11, 2, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_password_resets`
--

CREATE TABLE `tbl_password_resets` (
  `par_id` int(11) NOT NULL,
  `use_id` int(11) NOT NULL,
  `par_use_email` varchar(255) NOT NULL,
  `par_token` varchar(255) NOT NULL,
  `par_code_temp` int(11) NOT NULL,
  `par_created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_permissions`
--

CREATE TABLE `tbl_permissions` (
  `per_id` int(11) NOT NULL,
  `per_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `pag_id` int(11) DEFAULT NULL,
  `per_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_permissions`
--

INSERT INTO `tbl_permissions` (`per_id`, `per_name`, `pag_id`, `per_order`) VALUES
(1, 'Crear perfil', 2, 1),
(2, 'Modificar perfil', 2, 2),
(3, 'Eliminar perfil', 2, 3),
(4, 'Asignar permisos al perfil', 2, 4),
(5, 'Crear usuario', 3, 1),
(6, 'Modificar usuario', 3, 2),
(7, 'Eliminar usuario', 3, 3),
(8, 'Asignar permisos al usuario', 3, 4),
(9, 'Crear cliente', 5, 1),
(10, 'Modificar cliente', 5, 2),
(11, 'Eliminar cliente', 5, 3),
(12, 'Crear moto', 6, 1),
(13, 'Modificar moto', 6, 2),
(14, 'Eliminar moto', 6, 3),
(15, 'Crear orden de trabajo', 7, 1),
(16, 'Agregar ítem a la orden', 7, 2),
(17, 'Eliminar ítem de la orden', 7, 3),
(18, 'Cerrar orden (Entregar / Cancelar)', 7, 4),
(19, 'Revertir estado de orden Entregada', 7, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_profiles`
--

CREATE TABLE `tbl_profiles` (
  `pro_id` int(11) NOT NULL,
  `pro_name` varchar(255) DEFAULT NULL,
  `sta_id` int(11) DEFAULT NULL,
  `pro_pages` varchar(255) DEFAULT '',
  `pro_create_by` int(11) DEFAULT NULL,
  `pro_create_at` timestamp NULL DEFAULT current_timestamp(),
  `pro_update_by` int(11) DEFAULT NULL,
  `pro_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_profiles`
--

INSERT INTO `tbl_profiles` (`pro_id`, `pro_name`, `sta_id`, `pro_pages`, `pro_create_by`, `pro_create_at`, `pro_update_by`, `pro_update_at`) VALUES
(1, 'Administrador', 1, '', NULL, '2026-07-28 17:33:36', NULL, '2026-07-28 17:33:36'),
(2, 'Mecánico', 1, '', NULL, '2026-07-28 17:33:36', NULL, '2026-07-28 17:33:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_profile_permissions`
--

CREATE TABLE `tbl_profile_permissions` (
  `prp_id` int(11) NOT NULL,
  `per_id` int(11) NOT NULL,
  `pro_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_profile_permissions`
--

INSERT INTO `tbl_profile_permissions` (`prp_id`, `per_id`, `pro_id`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 6, 1),
(7, 7, 1),
(8, 8, 1),
(9, 9, 1),
(10, 10, 1),
(11, 11, 1),
(12, 12, 1),
(13, 13, 1),
(14, 14, 1),
(15, 15, 1),
(16, 16, 1),
(17, 17, 1),
(18, 18, 1),
(19, 19, 1),
(20, 9, 2),
(21, 10, 2),
(22, 12, 2),
(23, 13, 2),
(24, 15, 2),
(25, 16, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_status`
--

CREATE TABLE `tbl_status` (
  `sta_id` int(11) NOT NULL,
  `sta_name` varchar(100) NOT NULL,
  `sta_scope` enum('GENERAL') NOT NULL DEFAULT 'GENERAL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_status`
--

INSERT INTO `tbl_status` (`sta_id`, `sta_name`, `sta_scope`) VALUES
(1, 'Activo', 'GENERAL'),
(2, 'Inactivo', 'GENERAL'),
(3, 'Eliminado', 'GENERAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_users`
--

CREATE TABLE `tbl_users` (
  `use_id` int(11) NOT NULL,
  `use_name` varchar(255) DEFAULT NULL,
  `use_last_name` varchar(255) DEFAULT NULL,
  `use_identification` varchar(255) DEFAULT NULL,
  `use_user` varchar(100) DEFAULT NULL,
  `use_email` varchar(255) DEFAULT NULL,
  `use_password` varchar(255) DEFAULT NULL,
  `pro_id` int(11) DEFAULT NULL,
  `sta_id` int(11) DEFAULT 1,
  `use_access` smallint(6) DEFAULT 1 COMMENT 'acceso al sistema 1: SI, 0: NO',
  `use_change_password` smallint(6) DEFAULT 1 COMMENT 'cambiar contraseña 1: SI, 0: NO',
  `use_pages` varchar(255) DEFAULT '',
  `use_create_by` int(11) DEFAULT NULL,
  `use_create_at` timestamp NULL DEFAULT current_timestamp(),
  `use_update_by` int(11) DEFAULT NULL,
  `use_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_users`
--

INSERT INTO `tbl_users` (`use_id`, `use_name`, `use_last_name`, `use_identification`, `use_user`, `use_email`, `use_password`, `pro_id`, `sta_id`, `use_access`, `use_change_password`, `use_pages`, `use_create_by`, `use_create_at`, `use_update_by`, `use_update_at`) VALUES
(1, 'Carlos', 'Admin', NULL, 'admin', 'admin@tallerpavas.com', '$2b$10$aGWT1w1j1qW.AQ2mLbBb6OOMsH.2Vy9hya3lHLCN08AEO8ObWCRRa', 1, 1, 1, 0, '1,2,3,4,5,6,7', NULL, '2026-07-28 17:33:36', NULL, '2026-07-28 17:33:36'),
(2, 'Jorge', 'Mecánico', NULL, 'mecanico', 'mecanico@tallerpavas.com', '$2b$10$aGWT1w1j1qW.AQ2mLbBb6ODkW.uXlDZKI4PSMcW7XqRZQD0rAyb/a', 2, 1, 1, 0, '4,5,6,7', NULL, '2026-07-28 17:33:36', NULL, '2026-07-28 17:33:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_user_permissions`
--

CREATE TABLE `tbl_user_permissions` (
  `usp_id` int(11) NOT NULL,
  `per_id` int(11) NOT NULL,
  `use_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_user_permissions`
--

INSERT INTO `tbl_user_permissions` (`usp_id`, `per_id`, `use_id`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 6, 1),
(7, 7, 1),
(8, 8, 1),
(9, 9, 1),
(10, 10, 1),
(11, 11, 1),
(12, 12, 1),
(13, 13, 1),
(14, 14, 1),
(15, 15, 1),
(16, 16, 1),
(17, 17, 1),
(18, 18, 1),
(19, 19, 1),
(32, 9, 2),
(33, 10, 2),
(34, 12, 2),
(35, 13, 2),
(36, 15, 2),
(37, 16, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_work_orders`
--

CREATE TABLE `tbl_work_orders` (
  `ord_id` int(11) NOT NULL,
  `bik_id` int(11) NOT NULL,
  `ord_entry_date` datetime NOT NULL,
  `ord_fault_description` text NOT NULL,
  `ord_status` varchar(30) NOT NULL DEFAULT 'RECIBIDA',
  `ord_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ord_create_by` int(11) DEFAULT NULL,
  `ord_create_at` timestamp NULL DEFAULT current_timestamp(),
  `ord_update_by` int(11) DEFAULT NULL,
  `ord_update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_work_orders`
--

INSERT INTO `tbl_work_orders` (`ord_id`, `bik_id`, `ord_entry_date`, `ord_fault_description`, `ord_status`, `ord_total`, `ord_create_by`, `ord_create_at`, `ord_update_by`, `ord_update_at`) VALUES
(1, 1, '2026-07-26 12:33:36', 'Ruido metálico en el motor al acelerar en frío y fuga de aceite ligera.', 'RECIBIDA', 0.00, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(2, 2, '2026-07-27 12:33:36', 'Mantenimiento general de 15.000 KM, cambio de pastillas de freno y aceite.', 'EN_PROCESO', 270000.00, 1, '2026-07-28 17:33:36', 2, '2026-07-28 17:33:36'),
(3, 3, '2026-07-28 00:33:36', 'Reemplazo de kit de arrastre (cadena, piñón y catalina).', 'LISTA', 355000.00, 1, '2026-07-28 17:33:36', 2, '2026-07-28 17:33:36'),
(4, 4, '2026-07-23 12:33:36', 'Revisión del sistema eléctrico y cambio de batería.', 'ENTREGADA', 180000.00, 1, '2026-07-28 17:33:36', 1, '2026-07-28 17:33:36'),
(5, 5, '2026-07-28 16:37:34', 'CAMBIO DE ACEITE', 'ENTREGADA', 150000.00, 1, '2026-07-28 21:37:34', 1, '2026-07-28 21:38:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_work_order_items`
--

CREATE TABLE `tbl_work_order_items` (
  `item_id` int(11) NOT NULL,
  `ord_id` int(11) NOT NULL,
  `item_type` enum('MANO_OBRA','REPUESTO') NOT NULL,
  `item_description` varchar(255) NOT NULL,
  `item_count` int(11) NOT NULL,
  `item_unit_value` decimal(10,2) NOT NULL,
  `item_create_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_work_order_items`
--

INSERT INTO `tbl_work_order_items` (`item_id`, `ord_id`, `item_type`, `item_description`, `item_count`, `item_unit_value`, `item_create_at`) VALUES
(1, 2, 'REPUESTO', 'Aceite sintético Motul 7100 10W40 (4T)', 2, 65000.00, '2026-07-28 17:33:36'),
(2, 2, 'REPUESTO', 'Pastillas de freno delanteras Nissin', 1, 85000.00, '2026-07-28 17:33:36'),
(3, 2, 'MANO_OBRA', 'Mantenimiento preventivo general y sincronización', 1, 120000.00, '2026-07-28 17:33:36'),
(4, 3, 'REPUESTO', 'Kit de Arrastre DID reforzado 520VX3', 1, 310000.00, '2026-07-28 17:33:36'),
(5, 3, 'MANO_OBRA', 'Instalación y tensionado de kit de arrastre', 1, 45000.00, '2026-07-28 17:33:36'),
(6, 4, 'REPUESTO', 'Batería de Gel Bosch 12V 7Ah', 1, 140000.00, '2026-07-28 17:33:36'),
(7, 4, 'MANO_OBRA', 'Diagnóstico eléctrico y cambio de batería', 1, 40000.00, '2026-07-28 17:33:36'),
(8, 5, 'REPUESTO', 'Aceite', 3, 50000.00, '2026-07-28 21:38:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_work_order_status_history`
--

CREATE TABLE `tbl_work_order_status_history` (
  `his_id` int(11) NOT NULL,
  `ord_id` int(11) NOT NULL,
  `his_from_status` varchar(30) DEFAULT NULL COMMENT 'Nulo para el estado inicial al crear la orden',
  `his_to_status` varchar(30) NOT NULL,
  `his_note` text DEFAULT NULL,
  `use_id` int(11) NOT NULL COMMENT 'Usuario que realizó el cambio',
  `his_create_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_work_order_status_history`
--

INSERT INTO `tbl_work_order_status_history` (`his_id`, `ord_id`, `his_from_status`, `his_to_status`, `his_note`, `use_id`, `his_create_at`) VALUES
(1, 1, NULL, 'RECIBIDA', 'Recepción inicial del vehículo en taller.', 1, '2026-07-26 17:33:36'),
(2, 2, NULL, 'RECIBIDA', 'Orden recibida en sistema.', 1, '2026-07-27 17:33:36'),
(3, 2, 'RECIBIDA', 'DIAGNOSTICO', 'Iniciando evaluación física de la motocicleta.', 2, '2026-07-27 21:33:36'),
(4, 2, 'DIAGNOSTICO', 'EN_PROCESO', 'Se autorizan repuestos y mano de obra. En reparación.', 2, '2026-07-27 23:33:36'),
(5, 3, NULL, 'RECIBIDA', 'Recepción del vehículo.', 1, '2026-07-28 05:33:36'),
(6, 3, 'RECIBIDA', 'EN_PROCESO', 'Montaje directo de kit de arrastre.', 2, '2026-07-28 09:33:36'),
(7, 3, 'EN_PROCESO', 'LISTA', 'Mantenimiento finalizado, moto lista para entrega.', 2, '2026-07-28 15:33:36'),
(8, 4, NULL, 'RECIBIDA', 'Ingreso inicial.', 1, '2026-07-23 17:33:36'),
(9, 4, 'RECIBIDA', 'LISTA', 'Cambio de batería completado.', 2, '2026-07-24 17:33:36'),
(10, 4, 'LISTA', 'ENTREGADA', 'Entregada al cliente con factura cancelada.', 1, '2026-07-25 17:33:36'),
(11, 5, NULL, 'RECIBIDA', 'Creación de orden de trabajo en taller.', 1, '2026-07-28 21:37:34'),
(12, 5, 'RECIBIDA', 'DIAGNOSTICO', 'Cambio de aceite hecho', 1, '2026-07-28 21:37:52'),
(13, 5, 'DIAGNOSTICO', 'EN_PROCESO', NULL, 1, '2026-07-28 21:38:09'),
(14, 5, 'EN_PROCESO', 'LISTA', NULL, 1, '2026-07-28 21:38:11'),
(15, 5, 'LISTA', 'ENTREGADA', NULL, 1, '2026-07-28 21:38:13');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tbl_bikes`
--
ALTER TABLE `tbl_bikes`
  ADD PRIMARY KEY (`bik_id`) USING BTREE,
  ADD UNIQUE KEY `bik_plate` (`bik_plate`) USING BTREE,
  ADD KEY `tbl_bikes_clients` (`cli_id`),
  ADD KEY `tbl_bikes_status` (`sta_id`);

--
-- Indices de la tabla `tbl_clients`
--
ALTER TABLE `tbl_clients`
  ADD PRIMARY KEY (`cli_id`) USING BTREE,
  ADD KEY `tbl_clients_status` (`sta_id`);

--
-- Indices de la tabla `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD PRIMARY KEY (`doc_id`) USING BTREE,
  ADD KEY `tbl_documents_status` (`sta_id`);

--
-- Indices de la tabla `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD PRIMARY KEY (`not_id`) USING BTREE,
  ADD KEY `idx_noti_user` (`use_id`) USING BTREE;

--
-- Indices de la tabla `tbl_pages`
--
ALTER TABLE `tbl_pages`
  ADD PRIMARY KEY (`pag_id`) USING BTREE;

--
-- Indices de la tabla `tbl_page_permissions`
--
ALTER TABLE `tbl_page_permissions`
  ADD PRIMARY KEY (`pap_id`) USING BTREE,
  ADD KEY `tbl_page_permissions_profiles` (`pro_id`),
  ADD KEY `tbl_page_permissions_pages` (`pag_id`);

--
-- Indices de la tabla `tbl_password_resets`
--
ALTER TABLE `tbl_password_resets`
  ADD PRIMARY KEY (`par_id`) USING BTREE,
  ADD KEY `tbl_password_resets_users` (`use_id`);

--
-- Indices de la tabla `tbl_permissions`
--
ALTER TABLE `tbl_permissions`
  ADD PRIMARY KEY (`per_id`) USING BTREE,
  ADD KEY `tbl_permissions_pages` (`pag_id`);

--
-- Indices de la tabla `tbl_profiles`
--
ALTER TABLE `tbl_profiles`
  ADD PRIMARY KEY (`pro_id`) USING BTREE,
  ADD KEY `tbl_profiles_status` (`sta_id`);

--
-- Indices de la tabla `tbl_profile_permissions`
--
ALTER TABLE `tbl_profile_permissions`
  ADD PRIMARY KEY (`prp_id`) USING BTREE,
  ADD KEY `tbl_profile_permissions_permissions` (`per_id`),
  ADD KEY `tbl_profile_permissions_profiles` (`pro_id`);

--
-- Indices de la tabla `tbl_status`
--
ALTER TABLE `tbl_status`
  ADD PRIMARY KEY (`sta_id`) USING BTREE;

--
-- Indices de la tabla `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`use_id`) USING BTREE,
  ADD KEY `tbl_users_profiles` (`pro_id`),
  ADD KEY `tbl_users_status` (`sta_id`),
  ADD KEY `use_user` (`use_user`) USING BTREE,
  ADD KEY `use_email` (`use_email`) USING BTREE;

--
-- Indices de la tabla `tbl_user_permissions`
--
ALTER TABLE `tbl_user_permissions`
  ADD PRIMARY KEY (`usp_id`) USING BTREE,
  ADD KEY `tbl_user_permissions_permissions` (`per_id`),
  ADD KEY `tbl_user_permissions_users` (`use_id`);

--
-- Indices de la tabla `tbl_work_orders`
--
ALTER TABLE `tbl_work_orders`
  ADD PRIMARY KEY (`ord_id`) USING BTREE,
  ADD KEY `tbl_work_orders_bikes` (`bik_id`),
  ADD KEY `idx_work_orders_status` (`ord_status`) USING BTREE;

--
-- Indices de la tabla `tbl_work_order_items`
--
ALTER TABLE `tbl_work_order_items`
  ADD PRIMARY KEY (`item_id`) USING BTREE,
  ADD KEY `tbl_work_order_items_orders` (`ord_id`);

--
-- Indices de la tabla `tbl_work_order_status_history`
--
ALTER TABLE `tbl_work_order_status_history`
  ADD PRIMARY KEY (`his_id`) USING BTREE,
  ADD KEY `tbl_work_order_status_history_users` (`use_id`),
  ADD KEY `idx_order_history_date` (`ord_id`,`his_create_at`) USING BTREE;

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tbl_bikes`
--
ALTER TABLE `tbl_bikes`
  MODIFY `bik_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_clients`
--
ALTER TABLE `tbl_clients`
  MODIFY `cli_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tbl_documents`
--
ALTER TABLE `tbl_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  MODIFY `not_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_pages`
--
ALTER TABLE `tbl_pages`
  MODIFY `pag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tbl_page_permissions`
--
ALTER TABLE `tbl_page_permissions`
  MODIFY `pap_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `tbl_password_resets`
--
ALTER TABLE `tbl_password_resets`
  MODIFY `par_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_permissions`
--
ALTER TABLE `tbl_permissions`
  MODIFY `per_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `tbl_profiles`
--
ALTER TABLE `tbl_profiles`
  MODIFY `pro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_profile_permissions`
--
ALTER TABLE `tbl_profile_permissions`
  MODIFY `prp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `tbl_status`
--
ALTER TABLE `tbl_status`
  MODIFY `sta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `use_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_user_permissions`
--
ALTER TABLE `tbl_user_permissions`
  MODIFY `usp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `tbl_work_orders`
--
ALTER TABLE `tbl_work_orders`
  MODIFY `ord_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_work_order_items`
--
ALTER TABLE `tbl_work_order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tbl_work_order_status_history`
--
ALTER TABLE `tbl_work_order_status_history`
  MODIFY `his_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tbl_bikes`
--
ALTER TABLE `tbl_bikes`
  ADD CONSTRAINT `tbl_bikes_clients` FOREIGN KEY (`cli_id`) REFERENCES `tbl_clients` (`cli_id`),
  ADD CONSTRAINT `tbl_bikes_status` FOREIGN KEY (`sta_id`) REFERENCES `tbl_status` (`sta_id`);

--
-- Filtros para la tabla `tbl_clients`
--
ALTER TABLE `tbl_clients`
  ADD CONSTRAINT `tbl_clients_status` FOREIGN KEY (`sta_id`) REFERENCES `tbl_status` (`sta_id`);

--
-- Filtros para la tabla `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD CONSTRAINT `tbl_documents_status` FOREIGN KEY (`sta_id`) REFERENCES `tbl_status` (`sta_id`);

--
-- Filtros para la tabla `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD CONSTRAINT `tbl_notifications_users` FOREIGN KEY (`use_id`) REFERENCES `tbl_users` (`use_id`);

--
-- Filtros para la tabla `tbl_page_permissions`
--
ALTER TABLE `tbl_page_permissions`
  ADD CONSTRAINT `tbl_page_permissions_pages` FOREIGN KEY (`pag_id`) REFERENCES `tbl_pages` (`pag_id`),
  ADD CONSTRAINT `tbl_page_permissions_profiles` FOREIGN KEY (`pro_id`) REFERENCES `tbl_profiles` (`pro_id`);

--
-- Filtros para la tabla `tbl_password_resets`
--
ALTER TABLE `tbl_password_resets`
  ADD CONSTRAINT `tbl_password_resets_users` FOREIGN KEY (`use_id`) REFERENCES `tbl_users` (`use_id`);

--
-- Filtros para la tabla `tbl_permissions`
--
ALTER TABLE `tbl_permissions`
  ADD CONSTRAINT `tbl_permissions_pages` FOREIGN KEY (`pag_id`) REFERENCES `tbl_pages` (`pag_id`);

--
-- Filtros para la tabla `tbl_profiles`
--
ALTER TABLE `tbl_profiles`
  ADD CONSTRAINT `tbl_profiles_status` FOREIGN KEY (`sta_id`) REFERENCES `tbl_status` (`sta_id`);

--
-- Filtros para la tabla `tbl_profile_permissions`
--
ALTER TABLE `tbl_profile_permissions`
  ADD CONSTRAINT `tbl_profile_permissions_permissions` FOREIGN KEY (`per_id`) REFERENCES `tbl_permissions` (`per_id`),
  ADD CONSTRAINT `tbl_profile_permissions_profiles` FOREIGN KEY (`pro_id`) REFERENCES `tbl_profiles` (`pro_id`);

--
-- Filtros para la tabla `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `tbl_users_profiles` FOREIGN KEY (`pro_id`) REFERENCES `tbl_profiles` (`pro_id`),
  ADD CONSTRAINT `tbl_users_status` FOREIGN KEY (`sta_id`) REFERENCES `tbl_status` (`sta_id`);

--
-- Filtros para la tabla `tbl_user_permissions`
--
ALTER TABLE `tbl_user_permissions`
  ADD CONSTRAINT `tbl_user_permissions_permissions` FOREIGN KEY (`per_id`) REFERENCES `tbl_permissions` (`per_id`),
  ADD CONSTRAINT `tbl_user_permissions_users` FOREIGN KEY (`use_id`) REFERENCES `tbl_users` (`use_id`);

--
-- Filtros para la tabla `tbl_work_orders`
--
ALTER TABLE `tbl_work_orders`
  ADD CONSTRAINT `tbl_work_orders_bikes` FOREIGN KEY (`bik_id`) REFERENCES `tbl_bikes` (`bik_id`);

--
-- Filtros para la tabla `tbl_work_order_items`
--
ALTER TABLE `tbl_work_order_items`
  ADD CONSTRAINT `tbl_work_order_items_orders` FOREIGN KEY (`ord_id`) REFERENCES `tbl_work_orders` (`ord_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_work_order_status_history`
--
ALTER TABLE `tbl_work_order_status_history`
  ADD CONSTRAINT `tbl_work_order_status_history_orders` FOREIGN KEY (`ord_id`) REFERENCES `tbl_work_orders` (`ord_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_work_order_status_history_users` FOREIGN KEY (`use_id`) REFERENCES `tbl_users` (`use_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: reddeoficios
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.13-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bloqueo_fecha`
--

DROP TABLE IF EXISTS `bloqueo_fecha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bloqueo_fecha` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proveedor_id` int(11) NOT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_fechas` (`fecha_hora_inicio`,`fecha_hora_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloqueo_fecha`
--

LOCK TABLES `bloqueo_fecha` WRITE;
/*!40000 ALTER TABLE `bloqueo_fecha` DISABLE KEYS */;
/*!40000 ALTER TABLE `bloqueo_fecha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_proveedor`
--

DROP TABLE IF EXISTS `disponibilidad_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proveedor_id` int(11) NOT NULL,
  `dia_semana` tinyint(4) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_dia_semana` (`dia_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_proveedor`
--

LOCK TABLES `disponibilidad_proveedor` WRITE;
/*!40000 ALTER TABLE `disponibilidad_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensaje`
--

DROP TABLE IF EXISTS `mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensaje` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emisor_id` int(11) NOT NULL COMMENT 'ID del usuario que envía el mensaje',
  `receptor_id` int(11) NOT NULL COMMENT 'ID del usuario que recibe el mensaje',
  `publicacion_id` int(11) NOT NULL COMMENT 'Publicación sobre la que se está conversando',
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT 0 COMMENT 'Si el receptor leyó el mensaje',
  `fecha_lectura` datetime DEFAULT NULL,
  `eliminado_por_emisor` tinyint(1) DEFAULT 0,
  `eliminado_por_receptor` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_emisor` (`emisor_id`),
  KEY `idx_receptor` (`receptor_id`),
  KEY `idx_publicacion` (`publicacion_id`),
  KEY `idx_conversacion` (`emisor_id`,`receptor_id`,`publicacion_id`),
  KEY `idx_fecha` (`fecha_envio`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensaje`
--

LOCK TABLES `mensaje` WRITE;
/*!40000 ALTER TABLE `mensaje` DISABLE KEYS */;
INSERT INTO `mensaje` VALUES (1,17,16,14,'Hola!',0,NULL,0,0,'2025-10-31 00:08:26');
/*!40000 ALTER TABLE `mensaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacion`
--

DROP TABLE IF EXISTS `publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacion` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_creador_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `tipo_servicio` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `hora_inicio` time NOT NULL DEFAULT '09:00:00' COMMENT 'Hora de inicio de trabajo (ej: 08:00)',
  `hora_fin` time NOT NULL DEFAULT '18:00:00' COMMENT 'Hora de fin de trabajo (ej: 16:00)',
  `horas_minimas` decimal(3,1) NOT NULL DEFAULT 1.0 COMMENT 'Mínimo de horas por trabajo (ej: 1.0, 2.0, 0.5)',
  PRIMARY KEY (`id`),
  KEY `usuario_creador_id` (`usuario_creador_id`),
  CONSTRAINT `publicacion_ibfk_1` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion`
--

LOCK TABLES `publicacion` WRITE;
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
INSERT INTO `publicacion` VALUES (1,1,'Plomero Profesional con 15 años de experiencia','Plomero','094 123 456','Montevideo','Plomero matriculado con amplia experiencia en instalaciones sanitarias, destapaciones, reparación de cañerías, instalación de calefones y termotanques. Atiendo emergencias las 24 horas. Trabajo prolijo y garantizado. Emito factura. Presupuesto sin cargo.',NULL,'2025-10-29 23:40:52','08:00:00','20:00:00',2.0),(6,2,'Electricista Matriculada - Firma UTE','Electricista','095 234 567','Montevideo','Electricista con firma habilitada por UTE. Realizo instalaciones eléctricas completas, reparaciones, cambio de tableros, instalación de aires acondicionados, iluminación LED, automatización del hogar. Trabajo con todas las medidas de seguridad. Garantía en todos los trabajos.',NULL,'2025-10-29 23:55:14','09:00:00','18:00:00',1.5),(7,3,'Jardinería y Paisajismo - Mantenimiento Integral','Jardinero','099 345 678','Salto','Servicio profesional de jardinería y paisajismo. Mantenimiento de jardines, poda de árboles y setos, diseño de espacios verdes, instalación de riego automático, césped natural y artificial, limpieza de terrenos. Trabajo en casas, empresas y condominios. Equipo propio y personal capacitado.',NULL,'2025-10-29 23:59:18','07:00:00','17:00:00',3.0),(8,4,'Pintora Profesional - Interior y Exterior','Pintor','098 456 789','Rivera','Pintora con 10 años de experiencia en pintura de casas, apartamentos y locales comerciales. Pintura interior y exterior, texturados, alisados, empapelados, trabajos en altura. Uso pinturas de primera calidad. Trabajo limpio y puntual. Me adapto a tu presupuesto. Presupuesto gratis.',NULL,'2025-10-30 00:03:54','08:30:00','17:30:00',4.0),(9,5,'Carpintero - Muebles a Medida y Reparaciones','Carpintero','096 567 890','Canelones','Carpintero especializado en muebles a medida: placares, bibliotecas, muebles de cocina, escritorios, mesas. También realizo reparación de muebles antiguos, instalación de puertas y ventanas, decks de madera, pérgolas. Trabajo con maderas nobles y MDF. Diseños personalizados según tus necesidades.',NULL,'2025-10-30 00:12:16','09:00:00','19:00:00',2.0),(10,12,'Servicio de Limpieza Profesional - Hogares y Oficinas','Limpieza','092 678 901','Canelones','Servicio profesional de limpieza para casas, apartamentos y oficinas. Limpieza profunda, mantenimiento regular, limpieza post-obra, limpieza de mudanzas. Personal capacitado con productos de calidad y equipamiento profesional. También realizo limpieza de vidrios en altura, alfombras y tapizados. Referencias disponibles. Trabajo por hora o presupuesto cerrado.',NULL,'2025-10-30 22:13:42','07:00:00','17:00:00',3.0),(11,13,'Técnico en Computación - Reparación y Soporte','Informático','097 789 012','Montevideo','Técnico especializado en reparación de computadoras, notebooks y armado de PC. Instalación de sistemas operativos (Windows, Linux), recuperación de datos, eliminación de virus, actualización de hardware, configuración de redes WiFi, instalación de cámaras de seguridad. Servicio a domicilio o en mi taller. Atención a particulares y empresas. Garantía en todos los trabajos.',NULL,'2025-10-30 22:17:47','10:00:00','20:00:00',1.0),(12,14,'Repostería Artesanal - Tortas y Eventos','Otro','093 890 123','San José','Repostera profesional especializada en tortas personalizadas para cumpleaños, bodas, eventos corporativos. También preparo mesas dulces, cupcakes, cookies decoradas, macarons y postres para fiestas. Trabajo con ingredientes de primera calidad. Diseños únicos adaptados a tu celebración. Entrega sin cargo en Montevideo. Consulta por delivery a Ciudad de la Costa y Canelones.',NULL,'2025-10-30 22:22:58','09:00:00','19:00:00',2.0),(13,15,'Herrería y Metalúrgica - Rejas, Portones y Estructuras','Herrería','098 901 234','Maldonado','Herrero con 20 años de experiencia. Fabricación e instalación de rejas de seguridad, portones corredizos y batientes, barandas, escaleras caracol, estructuras metálicas, carpas metálicas, portones automáticos. También realizo reparaciones y mantenimiento. Trabajo en hierro, aluminio y acero inoxidable. Diseños modernos y clásicos. Presupuesto sin cargo.',NULL,'2025-10-30 22:27:02','07:30:00','19:30:00',4.0),(14,16,'Profesora Particular - Matemática y Física','Otro','095 012 345','Salto','Profesora de matemática y física para estudiantes de secundaria, UTU y bachillerato. Licenciada en Matemática con 8 años de experiencia en educación. Clases individuales o grupales (máximo 3 alumnos), apoyo para exámenes, preparación para parciales. Metodología personalizada según las necesidades del estudiante. Clases online o presenciales. Material de estudio incluido.',NULL,'2025-10-30 22:37:10','14:00:00','21:00:00',1.5);
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacion_imagen`
--

DROP TABLE IF EXISTS `publicacion_imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacion_imagen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `publicacion_id` int(11) NOT NULL,
  `ruta_imagen` varchar(500) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0 COMMENT 'TRUE si es la imagen que se muestra en la tarjeta',
  `orden` tinyint(4) DEFAULT 0 COMMENT 'Orden de visualización (0-9)',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_publicacion` (`publicacion_id`),
  KEY `idx_principal` (`publicacion_id`,`es_principal`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion_imagen`
--

LOCK TABLES `publicacion_imagen` WRITE;
/*!40000 ALTER TABLE `publicacion_imagen` DISABLE KEYS */;
INSERT INTO `publicacion_imagen` VALUES (1,1,'uploads/publicaciones/pub_1_img1_1761781252.jpg',1,0,'2025-10-29 23:40:52'),(2,1,'uploads/publicaciones/pub_1_img2_1761781252.jpg',0,1,'2025-10-29 23:40:52'),(3,1,'uploads/publicaciones/pub_1_img3_1761781252.webp',0,2,'2025-10-29 23:40:52'),(4,1,'uploads/publicaciones/pub_1_img4_1761781252.jpg',0,3,'2025-10-29 23:40:52'),(13,6,'uploads/publicaciones/pub_6_img1_1761782114.jpg',1,0,'2025-10-29 23:55:14'),(14,6,'uploads/publicaciones/pub_6_img2_1761782114.jpg',0,1,'2025-10-29 23:55:14'),(15,6,'uploads/publicaciones/pub_6_img3_1761782114.jpg',0,2,'2025-10-29 23:55:14'),(16,7,'uploads/publicaciones/pub_7_img1_1761782358.jpg',1,0,'2025-10-29 23:59:18'),(17,7,'uploads/publicaciones/pub_7_img2_1761782358.jpg',0,1,'2025-10-29 23:59:18'),(18,7,'uploads/publicaciones/pub_7_img3_1761782358.jpg',0,2,'2025-10-29 23:59:18'),(19,7,'uploads/publicaciones/pub_7_img4_1761782358.jpg',0,3,'2025-10-29 23:59:18'),(20,8,'uploads/publicaciones/pub_8_img1_1761782634.jpg',1,0,'2025-10-30 00:03:54'),(21,8,'uploads/publicaciones/pub_8_img2_1761782634.jpg',0,1,'2025-10-30 00:03:54'),(22,8,'uploads/publicaciones/pub_8_img3_1761782635.jpg',0,2,'2025-10-30 00:03:55'),(23,9,'uploads/publicaciones/pub_9_img1_1761783136.jpeg',1,0,'2025-10-30 00:12:16'),(24,9,'uploads/publicaciones/pub_9_img2_1761783136.jpeg',0,1,'2025-10-30 00:12:16'),(25,9,'uploads/publicaciones/pub_9_img3_1761783136.jpeg',0,2,'2025-10-30 00:12:16'),(26,9,'uploads/publicaciones/pub_9_img4_1761783136.jpg',0,3,'2025-10-30 00:12:16'),(27,10,'uploads/publicaciones/pub_10_img1_1761862422.jpg',1,0,'2025-10-30 22:13:42'),(28,10,'uploads/publicaciones/pub_10_img2_1761862422.jpg',0,1,'2025-10-30 22:13:42'),(29,10,'uploads/publicaciones/pub_10_img3_1761862422.jpg',0,2,'2025-10-30 22:13:42'),(30,10,'uploads/publicaciones/pub_10_img4_1761862422.jpg',0,3,'2025-10-30 22:13:42'),(31,11,'uploads/publicaciones/pub_11_img1_1761862667.jpg',1,0,'2025-10-30 22:17:47'),(32,11,'uploads/publicaciones/pub_11_img2_1761862667.jpg',0,1,'2025-10-30 22:17:47'),(33,11,'uploads/publicaciones/pub_11_img3_1761862667.jpg',0,2,'2025-10-30 22:17:47'),(34,11,'uploads/publicaciones/pub_11_img4_1761862667.jpg',0,3,'2025-10-30 22:17:47'),(35,11,'uploads/publicaciones/pub_11_img5_1761862667.jpg',0,4,'2025-10-30 22:17:47'),(36,12,'uploads/publicaciones/pub_12_img1_1761862978.jpg',1,0,'2025-10-30 22:22:58'),(37,12,'uploads/publicaciones/pub_12_img2_1761862978.jpg',0,1,'2025-10-30 22:22:58'),(38,12,'uploads/publicaciones/pub_12_img3_1761862978.jpg',0,2,'2025-10-30 22:22:58'),(39,12,'uploads/publicaciones/pub_12_img4_1761862978.jpg',0,3,'2025-10-30 22:22:58'),(40,13,'uploads/publicaciones/pub_13_img1_1761863222.jpg',1,0,'2025-10-30 22:27:02'),(41,13,'uploads/publicaciones/pub_13_img2_1761863222.jpg',0,1,'2025-10-30 22:27:02'),(42,13,'uploads/publicaciones/pub_13_img3_1761863222.jpg',0,2,'2025-10-30 22:27:02'),(43,14,'uploads/publicaciones/pub_14_img1_1761863830.jpg',1,0,'2025-10-30 22:37:10');
/*!40000 ALTER TABLE `publicacion_imagen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL COMMENT 'Usuario que hace la reserva (tipo 1)',
  `proveedor_id` int(11) NOT NULL COMMENT 'Usuario que recibe la reserva (tipo 2)',
  `publicacion_id` int(11) DEFAULT NULL COMMENT 'Publicación específica reservada',
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','completada','rechazada') DEFAULT 'pendiente',
  `cancelada_por` int(11) DEFAULT NULL COMMENT 'ID del usuario que canceló',
  `motivo_cancelacion` text DEFAULT NULL,
  `fecha_cancelacion` datetime DEFAULT NULL,
  `confirmada_por` int(11) DEFAULT NULL COMMENT 'ID del proveedor que confirmó',
  `fecha_confirmacion` datetime DEFAULT NULL,
  `rechazada_por` int(11) DEFAULT NULL COMMENT 'ID del proveedor que rechazó',
  `motivo_rechazo` text DEFAULT NULL,
  `fecha_rechazo` datetime DEFAULT NULL,
  `notas_cliente` text DEFAULT NULL COMMENT 'Mensaje del cliente al reservar',
  `respuesta_proveedor` text DEFAULT NULL COMMENT 'Respuesta del proveedor',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cliente_visto_estado` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_publicacion` (`publicacion_id`),
  KEY `idx_fecha_inicio` (`fecha_hora_inicio`),
  KEY `idx_fecha_fin` (`fecha_hora_fin`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (1,17,16,14,'2025-12-01 14:00:00','2025-12-01 16:00:00','pendiente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Prueba de reserva',NULL,'2025-10-31 00:08:13','2025-10-31 00:08:13',0);
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipoUsuario` int(11) DEFAULT NULL,
  `nombreCompleto` varchar(255) DEFAULT NULL,
  `correoElectronico` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `rut` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,2,'Roberto Martínez Silva','roberto.martinez@gmail.com','$2y$10$l5mcirHJ0rnwRXzouBTOqONPfNEKh2soVGKPGlFVUxej0g.2WPL9G','12345678-9'),(2,2,'María Fernanda Rodríguez','mafe.electricista@hotmail.com','$2y$10$ztHgXz6Iv7eP5lU3rXHGAO8NhJkAjhxMh0/ulYnVKAC7fo35SXEBu','23456789-0'),(3,2,'Carlos Mendoza Torres','carlos.jardinero@outlook.com','$2y$10$A.jLGqtQhB.77gZHqPRQZ.DM5THoma5a6xJPun9.RpFgp2dC/8SCi','34567890-1'),(4,2,'Ana Paula Suárez','anapinta@gmail.com','$2y$10$aPX3bxXXFsMjjBp6oGNdy.HPvhczLNhFALaGQanEikg83W3NZw66S','45678901-2'),(5,2,'Diego Fernández Lima','diego.carpintero@yahoo.com','$2y$10$3LJI4nM3H1QeAjnwJsJHBOQ9zoIa04PQ0oym3LOuW/1W/on9lPVkK','56789012-3'),(6,1,'Laura Beatriz González','laura.gonzalez@gmail.com','$2y$10$qmLhwzp5OUOC8sFSxr248.OghV0LB3JIN7.jIqlaF0EUCxKiFFwHq',NULL),(7,1,'Javier Ramos Pérez','javier.ramos@hotmail.com','$2y$10$scxC45nQt1iksZQXOgm.p.j.oknHqyXSK8jrwJ8Ghsow/epMfyV/a',NULL),(8,1,'Sofía Delgado Castro','sofia.delgado@outlook.com','$2y$10$1gQfpeDzRvVytMJcXKJD.O7q4emhwjgMVCg5Z5MONvZYHqfZxqFU6',NULL),(9,1,'Martín Olivera Sánchez','martin.olivera@gmail.com','$2y$10$f9RcgL3Y2x/G4nS47xhwcOyTYIHL/JmEItUw7p0/65yq43LJCNRBi',NULL),(10,1,'Valentina Torres Ruiz','vale.torres@yahoo.com','$2y$10$I8wITCYqRH9w/89l48L7i.Ct8qkqVPO2PKJAmwqMaEEg/6ZaMFBP2',NULL),(11,2,'Catalyst','catalystdigital@utu.com','$2y$10$pEDypkq3UI1EhT/dXOP1cOt1po1kIj/hUVPvZ4BgOIj0AYoIiRx3i',NULL),(12,2,'Patricia Méndez Olivera','patricia.limpieza@gmail.com','$2y$10$fBtohqp20Vuv1P8KOfGTTOJPeU3PS5SaHNfWpxjXeeEDBe3.vthqW','67890123-4'),(13,2,'Rodrigo Silva Martínez','rodrigo.technic@hotmail.com','$2y$10$1QGuAgWHQs3Lpht8wVWx8.mn4LLEi/VKh.KXCnZR61YD7JFqi8M9m','78901234-5'),(14,2,'Gabriela Romero Costa','gabi.reposteria@outlook.com','$2y$10$oEBWu59gzmYbC6kJ.rWlJeHxSFojg1YdrPvwttyIPAUpZN.tDcSrK','89012345-6'),(15,2,'Fernando Acosta López','fer.herreria@yahoo.com','$2y$10$H/duebNsPEZZmA4nAu9Tre1XQyj6im.RgubB4hb757p9a7XyO5I8i','90123456-7'),(16,2,'Lucía Pereyra Vidal','lucia.clases@gmail.com','$2y$10$eZsMMB83eICjLT5fjI0h..xKxvjZjjuR5CsZtj9ZRTqcrek8h0k9q','01234567-8'),(17,2,'Admin','admin@admin.com','$2y$10$.Dbxv4kCFx9IHmBPwd1WDuQCsp6zeKmvkslGReX7OEVGpoxmwEVxS',NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_ultimos_mensajes`
--

DROP TABLE IF EXISTS `vista_ultimos_mensajes`;
/*!50001 DROP VIEW IF EXISTS `vista_ultimos_mensajes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_ultimos_mensajes` AS SELECT 
 1 AS `id`,
 1 AS `emisor_id`,
 1 AS `receptor_id`,
 1 AS `publicacion_id`,
 1 AS `mensaje`,
 1 AS `leido`,
 1 AS `fecha_lectura`,
 1 AS `eliminado_por_emisor`,
 1 AS `eliminado_por_receptor`,
 1 AS `fecha_envio`,
 1 AS `emisor_nombre`,
 1 AS `receptor_nombre`,
 1 AS `publicacion_titulo`,
 1 AS `publicacion_imagen`,
 1 AS `proveedor_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_ultimos_mensajes`
--

/*!50001 DROP VIEW IF EXISTS `vista_ultimos_mensajes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_ultimos_mensajes` AS select `m`.`id` AS `id`,`m`.`emisor_id` AS `emisor_id`,`m`.`receptor_id` AS `receptor_id`,`m`.`publicacion_id` AS `publicacion_id`,`m`.`mensaje` AS `mensaje`,`m`.`leido` AS `leido`,`m`.`fecha_lectura` AS `fecha_lectura`,`m`.`eliminado_por_emisor` AS `eliminado_por_emisor`,`m`.`eliminado_por_receptor` AS `eliminado_por_receptor`,`m`.`fecha_envio` AS `fecha_envio`,`e`.`nombreCompleto` AS `emisor_nombre`,`r`.`nombreCompleto` AS `receptor_nombre`,`p`.`titulo` AS `publicacion_titulo`,`p`.`imagen` AS `publicacion_imagen`,`p`.`usuario_creador_id` AS `proveedor_id` from (((`mensaje` `m` join `usuario` `e` on(`m`.`emisor_id` = `e`.`id`)) join `usuario` `r` on(`m`.`receptor_id` = `r`.`id`)) join `publicacion` `p` on(`m`.`publicacion_id` = `p`.`id`)) where `m`.`id` in (select max(`mensaje`.`id`) from `mensaje` group by least(`mensaje`.`emisor_id`,`mensaje`.`receptor_id`),greatest(`mensaje`.`emisor_id`,`mensaje`.`receptor_id`),`mensaje`.`publicacion_id`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 21:25:53

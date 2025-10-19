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
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_creador_id` (`usuario_creador_id`),
  CONSTRAINT `publicacion_ibfk_1` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion`
--

LOCK TABLES `publicacion` WRITE;
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
INSERT INTO `publicacion` VALUES (1,NULL,'prueba','striper','0949999','cerro','hola','2025-10-07','2025-10-07','imagenes/1759880907_logo2.png','2025-10-07 23:48:27'),(3,NULL,'Ricardo Fontaner','plomeria','094999987','centro','hola te destapo el caño','2025-10-07','2025-10-08','imagenes/1759881911_logo2.png','2025-10-08 00:05:11'),(4,NULL,'Dictandor Fabian','plomeria','094999987','centro','hola te destapo el caño','2025-10-07','2025-10-08','imagenes/1759882159_logo2.png','2025-10-08 00:09:19'),(5,NULL,'Opa el pro','gaming','094999987','centro','Te llego a diamante en lo que quieras','2025-10-07','2025-10-08','imagenes/1759882369_logo2.png','2025-10-08 00:12:49'),(6,NULL,'Opa el pro2','gaming','094999987','centro','Te llego a diamante en lo que quieras','2025-10-07','2025-10-08','imagenes/1759883190_logo2.png','2025-10-08 00:26:30'),(7,NULL,'Dibujante tecnico','Dibujo para obras','0949999','Parque del plata','Años de experiencia como ayudante de arquitecto.','2025-10-14','2025-10-16',NULL,'2025-10-14 23:45:59'),(8,6,'Gamer','juegar jueguitos','123456767899','Tucasa','lala','2025-10-14','2025-10-16',NULL,'2025-10-15 01:08:24'),(9,7,'programador de dildos 3d','sexual','0929292','montevideo','Olor a culo integrado','2025-07-05','2025-10-23',NULL,'2025-10-15 01:19:17'),(10,5,'Compre-venta','comprar cosas y venderlas','0949999','Tucasa','Te vendo todo','2025-10-15','2025-10-16',NULL,'2025-10-16 00:11:45'),(11,5,'Prueba 1','prueba 1','0949999999','cerro','prueba 1','2025-10-17','2025-10-18',NULL,'2025-10-17 00:09:55'),(12,5,'Viernes','el cuerpo lo sape','123214321453','Montevideo y la costa','con tu mama','2025-10-18','2025-10-31',NULL,'2025-10-17 22:03:34');
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_publicacion` (`publicacion_id`),
  KEY `idx_fecha_inicio` (`fecha_hora_inicio`),
  KEY `idx_fecha_fin` (`fecha_hora_fin`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (1,1,2,1,'2025-10-17 11:00:00','2025-10-18 16:00:00','pendiente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Prueba de reserva',NULL,'2025-10-16 23:46:42','2025-10-16 23:46:42'),(2,1,5,11,'2025-10-17 11:00:00','2025-10-18 16:00:00','pendiente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Prueba de reserva',NULL,'2025-10-17 01:30:21','2025-10-17 01:30:21'),(3,5,5,11,'2025-10-20 20:11:00','2025-10-21 21:11:00','pendiente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Tirame la goma',NULL,'2025-10-17 21:12:04','2025-10-17 21:12:04'),(4,2,5,11,'2025-10-23 08:00:00','2025-10-24 16:00:00','pendiente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Necesito que me respondas si te sirve crack',NULL,'2025-10-17 21:59:24','2025-10-17 21:59:24');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,1,'leandro','leandro@gmail.com','$2y$10$B00vjsMAGsnYweEhkqowSemzYRJiaNw8YTih5lyNg8q3Un/eFXY2a',NULL),(2,1,'leandro','lea@lea.com','$2y$10$ENCpngZpb38cE8r1XiLHXuLPm0Uzp4kHmUW9MGgQNj5H5A.vA0Sp.',NULL),(3,1,'leandro','lea@lea.com','$2y$10$Nw.5NkYxHOHTOcd3PNUWq.VmlfhCMU1BOkSjAxRIZtw0c94PsdGxe',NULL),(4,1,'leandro','lea@lea.com','$2y$10$PWlmlzqyJLKdEZYAyh3yOOXKFjJ22cTMwNtp2NLjOcIm4ujkQq7Fi',NULL),(5,2,'leandro','leandro@utu.com','$2y$10$beI0qULjJSiMP0r1snY68eZsakXOdWl9ZSpX5j3MLp40yZTTk8CoO',NULL),(6,2,'pruebaman','pruebaman@prueba.com','$2y$10$ZVGJ7fCz74OOSu2ochTKv.Woka2YnbtrHsUqrogMM1n4WtOm8Ck/q',NULL),(7,2,'Enzo Olivera','latuya@gmail.com','$2y$10$t5VLNTIe/dxpiQf2MwmvhujofKNGWkSx1OZNLXNBK8qsGeZ1FhCDi','no'),(8,1,'Joel gay','joel@gay.com','$2y$10$5hwnZ/6pzIvmLhDpp5jFH.O6fJxhvQiy0fd3Jzjsb89BDaFj5Ersm','si');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17 19:16:43

-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: gateway01.eu-central-1.prod.aws.tidbcloud.com    Database: db_tfm
-- ------------------------------------------------------
-- Server version	8.0.11-TiDB-v8.5.3-serverless

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `condition` enum('NEW','VERY_GOOD','GOOD','USED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_of_manufacture` int NOT NULL,
  `case_material` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bracelet_material` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_box` tinyint NOT NULL,
  `original_papers` tinyint NOT NULL,
  `status` enum('DRAFT','PUBLISHED','UNDER_REVIEW','SOLD','RESERVED','RETIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `shipping_available` tinyint NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `fk_users_id` int NOT NULL,
  `fk_buyer_id` int DEFAULT NULL,
  `fk_styles_id` int NOT NULL,
  `fk_models_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Articulos_Usuarios_idx` (`fk_users_id`),
  KEY `fk_Articulos_categorias1_idx` (`fk_styles_id`),
  KEY `fk_articles_models1_idx` (`fk_models_id`),
  KEY `fk_articles_buyer_idx` (`fk_buyer_id`),
  KEY `fk_articles_buyer` (`fk_buyer_id`),
  CONSTRAINT `fk_Articulos_categorias1` FOREIGN KEY (`fk_styles_id`) REFERENCES `styles` (`id`),
  CONSTRAINT `fk_Articulos_Usuarios` FOREIGN KEY (`fk_users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_articles_models1` FOREIGN KEY (`fk_models_id`) REFERENCES `models` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_articles_buyer` FOREIGN KEY (`fk_buyer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=450001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `articles_images`
--

DROP TABLE IF EXISTS `articles_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_cover` tinyint NOT NULL DEFAULT '0',
  `fk_articles_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Imagenes_articulo_articulos1_idx` (`fk_articles_id`),
  CONSTRAINT `fk_Imagenes_articulo_articulos1` FOREIGN KEY (`fk_articles_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=210001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=90001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `fk_buyer_id` int NOT NULL,
  `fk_articles_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Conversaciones_Usuarios2_idx` (`fk_buyer_id`),
  KEY `fk_Conversaciones_Articulos1_idx` (`fk_articles_id`),
  CONSTRAINT `fk_Conversaciones_Articulos1` FOREIGN KEY (`fk_articles_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Conversaciones_Usuarios2` FOREIGN KEY (`fk_buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=570001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `fk_users_id` int NOT NULL,
  `fk_articles_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Usuarios_has_Articulos_Articulos1_idx` (`fk_articles_id`),
  KEY `fk_Usuarios_has_Articulos_Usuarios1_idx` (`fk_users_id`),
  CONSTRAINT `fk_Usuarios_has_Articulos_Articulos1` FOREIGN KEY (`fk_articles_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Usuarios_has_Articulos_Usuarios1` FOREIGN KEY (`fk_users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=750001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint DEFAULT '0',
  `fk_chats_id` int NOT NULL,
  `fk_sender_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Mensajes_Conversaciones1_idx` (`fk_chats_id`),
  KEY `fk_Mensajes_Usuarios1_idx` (`fk_sender_id`),
  CONSTRAINT `fk_Mensajes_Conversaciones1` FOREIGN KEY (`fk_chats_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Mensajes_Usuarios1` FOREIGN KEY (`fk_sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=270001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `models` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('MENS','WOMENS','UNISEX') COLLATE utf8mb4_unicode_ci NOT NULL,
  `movement_type` enum('AUTOMATIC','MANUAL','QUARTZ','KINETIC') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_brands_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_models_brands1_idx` (`fk_brands_id`),
  CONSTRAINT `fk_models_brands1` FOREIGN KEY (`fk_brands_id`) REFERENCES `brands` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=150001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('MODERATION','NEW_MESSAGE','ARTICLE_STATUS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `fk_users_id` int NOT NULL,
  `fk_articles_id` int DEFAULT NULL,
  `fk_reports_id` int DEFAULT NULL,
  `fk_chats_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_notifications_users1_idx` (`fk_users_id`),
  KEY `fk_notifications_articles1_idx` (`fk_articles_id`),
  KEY `fk_notifications_reports1_idx` (`fk_reports_id`),
  KEY `fk_notifications_chats1_idx` (`fk_chats_id`),
  CONSTRAINT `fk_notifications_users1` FOREIGN KEY (`fk_users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_articles1` FOREIGN KEY (`fk_articles_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_reports1` FOREIGN KEY (`fk_reports_id`) REFERENCES `reports` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_chats1` FOREIGN KEY (`fk_chats_id`) REFERENCES `chats` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biography` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `fk_usuarios_id` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_profiles_usuarios1_idx` (`fk_usuarios_id`),
  UNIQUE KEY `fk_usuarios_id_UNIQUE` (`fk_usuarios_id`),
  CONSTRAINT `fk_profiles_usuarios1` FOREIGN KEY (`fk_usuarios_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=720001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reason` enum('fake_item','scam_attempt','suspicious_price','spam','inappropriate_content','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','UNDER REVIEW','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `fk_articles_id` int DEFAULT NULL,
  `fk_users_id` int NOT NULL,
  `fk_reported_user_id` int DEFAULT NULL,
  `fk_moderator_id` int DEFAULT NULL,
  `resolution` enum('APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moderator_note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Reportes_Articulos1_idx` (`fk_articles_id`),
  KEY `fk_Reportes_Usuarios1_idx` (`fk_users_id`),
  KEY `fk_reports_users1_idx` (`fk_moderator_id`),
  KEY `fk_reports_moderator` (`fk_moderator_id`),
  KEY `fk_reported_user_id_idx` (`fk_reported_user_id`),
  CONSTRAINT `fk_Reportes_Articulos1` FOREIGN KEY (`fk_articles_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Reportes_Usuarios1` FOREIGN KEY (`fk_users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_moderator` FOREIGN KEY (`fk_moderator_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_reported_user_id_fk` FOREIGN KEY (`fk_reported_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=330001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stars` int NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `fk_buyer_id` int NOT NULL,
  `fk_seller_id` int NOT NULL,
  `fk_article_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_Valoraciones_usuarios1_idx` (`fk_buyer_id`),
  KEY `fk_Valoraciones_usuarios2_idx` (`fk_seller_id`),
  KEY `fk_Valoraciones_articulos1_idx` (`fk_article_id`),
  CONSTRAINT `fk_Valoraciones_usuarios1` FOREIGN KEY (`fk_buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Valoraciones_usuarios2` FOREIGN KEY (`fk_seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Valoraciones_articulos1` FOREIGN KEY (`fk_article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `styles`
--

DROP TABLE IF EXISTS `styles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `styles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=150001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','BLOCKED','DELETED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `update_at` datetime NOT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=780001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_roles`
--

DROP TABLE IF EXISTS `users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_roles` (
  `fk_users_id` int NOT NULL,
  `fk_roles_id` int NOT NULL,
  `assigned_at` datetime NOT NULL,
  KEY `fk_users_has_roles_roles1_idx` (`fk_roles_id`),
  KEY `fk_users_has_roles_users1_idx` (`fk_users_id`),
  CONSTRAINT `fk_users_has_roles_users1` FOREIGN KEY (`fk_users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_users_has_roles_roles1` FOREIGN KEY (`fk_roles_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;



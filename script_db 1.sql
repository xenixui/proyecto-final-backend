-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema db_tfm
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema db_tfm
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_tfm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `db_tfm` ;

-- -----------------------------------------------------
-- Table `db_tfm`.`styles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`styles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'BLOCKED', 'DELETED') NOT NULL,
  `created_at` DATETIME NOT NULL,
  `update_at` DATETIME NOT NULL,
  `last_login` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`brands`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(50) NOT NULL,
  `logo_url` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`models`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`models` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `reference` VARCHAR(50) NOT NULL,
  `gender` ENUM('MENS', 'WOMENS', 'UNISEX') NOT NULL,
  `movement_type` ENUM('AUTOMATIC', 'MANUAL', 'QUARTZ', 'KINETIC') NOT NULL,
  `fk_brands_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_models_brands1_idx` (`fk_brands_id` ASC) VISIBLE,
  CONSTRAINT `fk_models_brands1`
    FOREIGN KEY (`fk_brands_id`)
    REFERENCES `db_tfm`.`brands` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`articles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`articles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `condition` ENUM('NEW', 'VERY_GOOD', 'GOOD', 'USED') NOT NULL,
  `year_of_manufacture` INT NOT NULL,
  `case_material` VARCHAR(50) NULL,
  `bracelet_material` VARCHAR(50) NULL,
  `original_box` TINYINT NOT NULL,
  `original_papers` TINYINT NOT NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'UNDER_REVIEW', 'SOLD', 'RESERVED', 'RETIRED') NOT NULL DEFAULT 'DRAFT',
  `shipping_available` TINYINT NOT NULL,
  `published_at` DATETIME NULL,
  `fk_users_id` INT NOT NULL,
  `fk_styles_id` INT NOT NULL,
  `fk_models_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Articulos_Usuarios_idx` (`fk_users_id` ASC) VISIBLE,
  INDEX `fk_Articulos_categorias1_idx` (`fk_styles_id` ASC) VISIBLE,
  INDEX `fk_articles_models1_idx` (`fk_models_id` ASC) VISIBLE,
  CONSTRAINT `fk_Articulos_categorias1`
    FOREIGN KEY (`fk_styles_id`)
    REFERENCES `db_tfm`.`styles` (`id`),
  CONSTRAINT `fk_Articulos_Usuarios`
    FOREIGN KEY (`fk_users_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_articles_models1`
    FOREIGN KEY (`fk_models_id`)
    REFERENCES `db_tfm`.`models` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`favorite`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`favorite` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `fk_users_id` INT NOT NULL,
  `fk_articles_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Usuarios_has_Articulos_Articulos1_idx` (`fk_articles_id` ASC) VISIBLE,
  INDEX `fk_Usuarios_has_Articulos_Usuarios1_idx` (`fk_users_id` ASC) VISIBLE,
  CONSTRAINT `fk_Usuarios_has_Articulos_Articulos1`
    FOREIGN KEY (`fk_articles_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Usuarios_has_Articulos_Usuarios1`
    FOREIGN KEY (`fk_users_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`chats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`chats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NULL,
  `update_at` DATETIME NULL,
  `fk_buyer_id` INT NOT NULL,
  `fk_articles_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Conversaciones_Usuarios2_idx` (`fk_buyer_id` ASC) VISIBLE,
  INDEX `fk_Conversaciones_Articulos1_idx` (`fk_articles_id` ASC) VISIBLE,
  CONSTRAINT `fk_Conversaciones_Articulos1`
    FOREIGN KEY (`fk_articles_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Conversaciones_Usuarios2`
    FOREIGN KEY (`fk_buyer_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` TINYINT NULL DEFAULT 0,
  `fk_chats_id` INT NOT NULL,
  `fk_sender_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Mensajes_Conversaciones1_idx` (`fk_chats_id` ASC) VISIBLE,
  INDEX `fk_Mensajes_Usuarios1_idx` (`fk_sender_id` ASC) VISIBLE,
  CONSTRAINT `fk_Mensajes_Conversaciones1`
    FOREIGN KEY (`fk_chats_id`)
    REFERENCES `db_tfm`.`chats` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Mensajes_Usuarios1`
    FOREIGN KEY (`fk_sender_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`reports`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reason` TEXT NOT NULL,
  `status` ENUM('PENDING', 'UNDER REVIEW', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NULL,
  `fk_articles_id` INT NOT NULL,
  `fk_users_id` INT NOT NULL,
  `fk_moderator_id` INT NULL,
  `resolution` ENUM('APPROVED', 'RETIRED') NULL,
  `moderator_note` TEXT NULL,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Reportes_Articulos1_idx` (`fk_articles_id` ASC) VISIBLE,
  INDEX `fk_Reportes_Usuarios1_idx` (`fk_users_id` ASC) VISIBLE,
  INDEX `fk_reports_users1_idx` (`fk_moderator_id` ASC) VISIBLE,
  CONSTRAINT `fk_Reportes_Articulos1`
    FOREIGN KEY (`fk_articles_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Reportes_Usuarios1`
    FOREIGN KEY (`fk_users_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_users1`
    FOREIGN KEY (`fk_moderator_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `db_tfm`.`articles_images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`articles_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `image_url` VARCHAR(255) NOT NULL,
  `is_cover` TINYINT NOT NULL DEFAULT 0,
  `fk_articles_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Imagenes_articulo_articulos1_idx` (`fk_articles_id` ASC) VISIBLE,
  CONSTRAINT `fk_Imagenes_articulo_articulos1`
    FOREIGN KEY (`fk_articles_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stars` INT NOT NULL,
  `comentario` TEXT NULL,
  `created_at` DATETIME NULL,
  `fk_buyer_id` INT NOT NULL,
  `fk_seller_id` INT NOT NULL,
  `fk_article_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Valoraciones_usuarios1_idx` (`fk_buyer_id` ASC) VISIBLE,
  INDEX `fk_Valoraciones_usuarios2_idx` (`fk_seller_id` ASC) VISIBLE,
  INDEX `fk_Valoraciones_articulos1_idx` (`fk_article_id` ASC) VISIBLE,
  CONSTRAINT `fk_Valoraciones_usuarios1`
    FOREIGN KEY (`fk_buyer_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Valoraciones_usuarios2`
    FOREIGN KEY (`fk_seller_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Valoraciones_articulos1`
    FOREIGN KEY (`fk_article_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `photo_url` VARCHAR(255) NULL,
  `name` VARCHAR(50) NULL,
  `surname` VARCHAR(50) NULL,
  `phone` VARCHAR(15) NULL,
  `country` VARCHAR(50) NULL,
  `city` VARCHAR(50) NULL,
  `postal_code` VARCHAR(15) NULL,
  `biography` TEXT NULL,
  `created_at` DATETIME NULL,
  `fk_usuarios_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_profiles_usuarios1_idx` (`fk_usuarios_id` ASC) VISIBLE,
  UNIQUE INDEX `fk_usuarios_id_UNIQUE` (`fk_usuarios_id` ASC) VISIBLE,
  CONSTRAINT `fk_profiles_usuarios1`
    FOREIGN KEY (`fk_usuarios_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `message` TEXT NOT NULL,
  `type` ENUM('MODERATION', 'NEW_MESSAGE', 'ARTICLE_STATUS') NOT NULL,
  `is_read` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NULL,
  `fk_users_id` INT NOT NULL,
  `fk_articles_id` INT NULL,
  `fk_reports_id` INT NULL,
  `fk_chats_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_notifications_users1_idx` (`fk_users_id` ASC) VISIBLE,
  INDEX `fk_notifications_articles1_idx` (`fk_articles_id` ASC) VISIBLE,
  INDEX `fk_notifications_reports1_idx` (`fk_reports_id` ASC) VISIBLE,
  INDEX `fk_notifications_chats1_idx` (`fk_chats_id` ASC) VISIBLE,
  CONSTRAINT `fk_notifications_users1`
    FOREIGN KEY (`fk_users_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_articles1`
    FOREIGN KEY (`fk_articles_id`)
    REFERENCES `db_tfm`.`articles` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_reports1`
    FOREIGN KEY (`fk_reports_id`)
    REFERENCES `db_tfm`.`reports` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_chats1`
    FOREIGN KEY (`fk_chats_id`)
    REFERENCES `db_tfm`.`chats` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rol` ENUM('USER', 'MODERATOR', 'ADMINISTRATOR') NOT NULL DEFAULT 'USER',
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tfm`.`users_roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tfm`.`users_roles` (
  `fk_users_id` INT NOT NULL,
  `fk_roles_id` INT NOT NULL,
  `assigned_at` DATETIME NOT NULL,
  INDEX `fk_users_has_roles_roles1_idx` (`fk_roles_id` ASC) VISIBLE,
  INDEX `fk_users_has_roles_users1_idx` (`fk_users_id` ASC) VISIBLE,
  CONSTRAINT `fk_users_has_roles_users1`
    FOREIGN KEY (`fk_users_id`)
    REFERENCES `db_tfm`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_users_has_roles_roles1`
    FOREIGN KEY (`fk_roles_id`)
    REFERENCES `db_tfm`.`roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

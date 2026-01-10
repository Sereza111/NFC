-- Инициализация базы данных для NFC-VL.RU
-- Выполните этот скрипт на MySQL сервере (10.19.0.1)

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS nfc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя (с доступом из приватной сети)
CREATE USER IF NOT EXISTS 'nfc'@'%' IDENTIFIED BY 'w%eJzfsAiGj3';
CREATE USER IF NOT EXISTS 'nfc'@'10.19.0.%' IDENTIFIED BY 'w%eJzfsAiGj3';

-- Предоставление прав
GRANT ALL PRIVILEGES ON nfc.* TO 'nfc'@'%';
GRANT ALL PRIVILEGES ON nfc.* TO 'nfc'@'10.19.0.%';
FLUSH PRIVILEGES;

-- Переключаемся на базу nfc
USE nfc;

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  participant_code VARCHAR(32) NULL,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  payment_id VARCHAR(255) NULL,
  payment_status VARCHAR(64) NULL,
  payment_method VARCHAR(64) NULL,
  is_card_binding BOOLEAN DEFAULT FALSE,
  paid_at DATETIME NULL,
  canceled_at DATETIME NULL,
  
  -- Поля доставки
  delivery_method VARCHAR(64) NULL,
  delivery_method_name VARCHAR(255) NULL,
  delivery_cost DECIMAL(10,2) DEFAULT 0,
  delivery_min_days INT NULL,
  delivery_max_days INT NULL,
  delivery_address TEXT NULL,
  delivery_postal_code VARCHAR(20) NULL,
  
  -- Полные данные заказа в JSON
  raw JSON NOT NULL,
  
  PRIMARY KEY (id),
  INDEX idx_created_at (created_at),
  INDEX idx_payment_id (payment_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_participant_code (participant_code),
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица промокодов (опционально)
CREATE TABLE IF NOT EXISTS promo_codes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) NULL,
  max_uses INT NULL,
  current_uses INT DEFAULT 0,
  expires_at DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_code (code),
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка тестовых промокодов
INSERT INTO promo_codes (code, discount_type, discount_value, description, max_uses) VALUES
  ('WELCOME10', 'percent', 10.00, 'Скидка 10% на первый заказ', NULL),
  ('SAVE200', 'fixed', 200.00, 'Скидка 200₽', NULL),
  ('FIRST', 'percent', 15.00, 'Скидка 15% на первый заказ', 100),
  ('NFC2025', 'fixed', 100.00, 'Скидка 100₽', NULL)
ON DUPLICATE KEY UPDATE code=code;

-- Показать статус
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as promo_codes_count FROM promo_codes;


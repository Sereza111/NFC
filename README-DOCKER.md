# NFC-VL.RU - Docker Deployment Guide

## Требования

- Docker и Docker Compose установлены на сервере
- Доступ к приватной сети 10.19.0.0/24
- MySQL база данных на 10.19.0.1:3306
- Открыт порт 10002 на сервере

## Настройка базы данных MySQL

Перед запуском убедитесь, что база данных настроена:

```sql
CREATE DATABASE IF NOT EXISTS nfc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nfc'@'%' IDENTIFIED BY 'w%eJzfsAiGj3';
GRANT ALL PRIVILEGES ON nfc.* TO 'nfc'@'%';
FLUSH PRIVILEGES;
```

## Деплой через Portainer

### Вариант 1: Git Repository (Рекомендуется)

1. В Portainer выберите **Stacks** → **Add stack**
2. Выберите метод **Repository**
3. Заполните поля:
   - **Name**: `nfc-site`
   - **Repository URL**: URL вашего Git репозитория
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
4. Нажмите **Deploy the stack**

### Вариант 2: Web Editor

1. В Portainer выберите **Stacks** → **Add stack**
2. Выберите метод **Web editor**
3. Скопируйте содержимое `docker-compose.yml`
4. Нажмите **Deploy the stack**

### Вариант 3: Upload

1. В Portainer выберите **Stacks** → **Add stack**
2. Выберите метод **Upload**
3. Загрузите файл `docker-compose.yml`
4. Нажмите **Deploy the stack**

## Локальная сборка и деплой

```bash
# Сборка образа
docker build -t nfc-site:latest .

# Запуск через docker-compose
docker-compose up -d

# Проверка логов
docker-compose logs -f nfc-app

# Остановка
docker-compose down

# Перезапуск после изменений
docker-compose down && docker-compose up -d --build
```

## Проверка работоспособности

После запуска проверьте:

1. **Healthcheck контейнера**:
```bash
docker ps
# Должен показать "healthy" в статусе
```

2. **API endpoint**:
```bash
curl http://localhost:10002/api/health
# Должен вернуть: {"ok":true}
```

3. **Подключение к базе данных**:
```bash
docker logs nfc-site
# Должно быть: "Database initialized"
```

4. **Доступ к сайту**:
```bash
curl http://85.198.84.223:10002
```

## Структура проекта

```
.
├── server.js           # Express сервер
├── db.js              # MySQL подключение
├── package.json       # Node.js зависимости
├── Dockerfile         # Docker образ
├── docker-compose.yml # Docker Compose конфигурация
├── dist/              # Собранный фронтенд (создается при сборке)
└── data/              # Данные (персистентные)
    └── cards/         # JSON файлы карточек
```

## Переменные окружения

Все переменные настроены в `docker-compose.yml`:

- `DB_HOST=10.19.0.1` - Приватный IP базы данных
- `DB_PORT=3306` - Порт MySQL
- `DB_USER=nfc` - Пользователь БД
- `DB_PASSWORD=w%eJzfsAiGj3` - Пароль БД
- `DB_NAME=nfc` - Имя базы данных
- `PORT=10002` - Порт приложения
- `SITE_URL=https://nfc-vl.ru` - URL сайта

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker logs nfc-site

# Проверить статус
docker ps -a | grep nfc-site
```

### Не подключается к базе данных

```bash
# Проверить доступ к приватной сети из контейнера
docker exec nfc-site ping -c 3 10.19.0.1

# Проверить порт MySQL
docker exec nfc-site nc -zv 10.19.0.1 3306
```

### Ошибки сборки

```bash
# Очистить кеш и пересобрать
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## Обновление приложения

```bash
# Остановить контейнер
docker-compose down

# Получить изменения из Git (если используете)
git pull

# Пересобрать и запустить
docker-compose up -d --build

# Проверить логи
docker-compose logs -f
```

## Мониторинг

В Portainer вы можете:

- Просматривать логи в реальном времени
- Мониторить использование CPU и RAM
- Управлять контейнером (старт/стоп/рестарт)
- Просматривать статистику

## Безопасность

- Все секретные данные хранятся в переменных окружения
- База данных доступна только через приватную сеть
- Приложение слушает порт только на нужном интерфейсе

## Поддержка

При проблемах проверьте:
1. Логи контейнера: `docker logs nfc-site`
2. Healthcheck: `docker inspect nfc-site | grep Health -A 10`
3. Сетевое подключение к БД
4. Переменные окружения в Portainer


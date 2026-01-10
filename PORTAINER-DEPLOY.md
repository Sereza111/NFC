# Пошаговая инструкция деплоя NFC-VL.RU в Portainer

## Шаг 1: Подготовка базы данных MySQL

Подключитесь к вашей базе данных через phpMyAdmin (показано на скриншоте) по адресу **10.19.0.1** и выполните SQL команды:

```sql
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS nfc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя
CREATE USER IF NOT EXISTS 'nfc'@'%' IDENTIFIED BY 'w%eJzfsAiGj3';

-- Предоставление прав
GRANT ALL PRIVILEGES ON nfc.* TO 'nfc'@'%';
FLUSH PRIVILEGES;
```

Или загрузите и выполните файл `init-database.sql` через phpMyAdmin.

## Шаг 2: Загрузка кода в Git репозиторий

Если вы используете Git (рекомендуется):

```bash
# Инициализация репозитория (если не сделано)
git init

# Добавление файлов
git add .

# Коммит
git commit -m "Initial commit: NFC site with Docker"

# Добавление удаленного репозитория (замените на свой URL)
git remote add origin https://github.com/ваш-username/nfc-vl.ru.git

# Отправка в репозиторий
git push -u origin main
```

## Шаг 3: Создание стека в Portainer

### A. Через Git Repository (Рекомендуется)

1. Откройте Portainer на **85.198.84.223:9000**
2. Перейдите в **Stacks** → **Add stack**
3. Введите имя стека: `nfc-site`
4. Выберите **Build method**: `Repository`
5. Заполните поля:
   - **Authentication**: Включите, если репозиторий приватный
   - **Repository URL**: `https://github.com/ваш-username/nfc-vl.ru.git`
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
   - **GitOps updates**: Включите для автообновления (опционально)
6. Нажмите **Deploy the stack**

### B. Через Web Editor (Если нет Git)

1. Откройте Portainer
2. Перейдите в **Stacks** → **Add stack**
3. Введите имя стека: `nfc-site`
4. Выберите **Build method**: `Web editor`
5. Скопируйте и вставьте содержимое файла `docker-compose.yml`:

```yaml
version: '3.8'

services:
  nfc-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nfc-site
    image: nfc-site:latest
    ports:
      - "10002:10002"
    environment:
      - NODE_ENV=production
      - PORT=10002
      - DB_HOST=10.19.0.1
      - DB_PORT=3306
      - DB_USER=nfc
      - DB_PASSWORD=w%eJzfsAiGj3
      - DB_NAME=nfc
      - TELEGRAM_BOT_TOKEN=8298634817:AAGvgd7K3U3RoPz-2SQlqzck-kUVT92DitY
      - TELEGRAM_CHAT_ID=7121428208
      - YOKASSA_SHOP_ID=1193300
      - YOKASSA_SECRET_KEY=live_kncdpR_fVgBHaBvULcl5HDJmb-Hf5ihnzHJwX4OTDqY
      - SITE_URL=https://nfc-vl.ru
      - RUSSIAN_POST_TOKEN=Jb2XiiReaTSgDUBHr1f59HosaXhFjF31
      - RUSSIAN_POST_LOGIN=seregaboj619@gmail.com
      - RUSSIAN_POST_PASSWORD=Sereza_Bojkenco11
      - DADATA_API_KEY=15c5a4e1d5b23f81f87ce3a68fd19ca7dd1452e5
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:10002/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    volumes:
      - ./data:/app/data
```

6. Нажмите **Deploy the stack**

## Шаг 4: Проверка статуса деплоя

1. **Мониторинг сборки**:
   - В Portainer перейдите в **Stacks** → **nfc-site**
   - Нажмите на контейнер **nfc-site**
   - Перейдите в **Logs** для просмотра логов сборки

2. **Ожидайте завершения**:
   - Сборка может занять 3-5 минут
   - Вы увидите процесс установки `node_modules` и сборки frontend
   - Статус контейнера должен стать **running** и **healthy** (зеленая точка)

3. **Проверка логов**:
   
   В логах должны быть строки:
   ```
   ✅ YooKassa credentials configured
   ✅ Russian Post API configured
   ✅ DaData API configured - REAL post offices enabled
   Database initialized
   Server listening on http://0.0.0.0:10002
   ```

## Шаг 5: Проверка работоспособности

### A. Проверка через браузер

Откройте в браузере:
- `http://85.198.84.223:10002` - главная страница сайта
- `http://85.198.84.223:10002/api/health` - должен вернуть `{"ok":true}`

### B. Проверка подключения к БД

В Portainer:
1. Перейдите в **Containers** → **nfc-site**
2. Нажмите **Console**
3. Выберите `/bin/sh` и нажмите **Connect**
4. Выполните команды:

```bash
# Проверка связи с БД
ping -c 3 10.19.0.1

# Проверка порта MySQL
nc -zv 10.19.0.1 3306

# Проверка переменных окружения
env | grep DB_
```

### C. Проверка через curl (из другого контейнера или хоста)

```bash
# Healthcheck
curl http://85.198.84.223:10002/api/health

# Главная страница
curl -I http://85.198.84.223:10002
```

## Шаг 6: Настройка Reverse Proxy (Nginx/Caddy)

Для работы по HTTPS через домен `nfc-vl.ru` настройте reverse proxy:

### Пример Nginx конфигурации:

```nginx
server {
    listen 80;
    server_name nfc-vl.ru www.nfc-vl.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nfc-vl.ru www.nfc-vl.ru;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://85.198.84.223:10002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Возможные проблемы и решения

### ❌ Контейнер не запускается

**Проблема**: Контейнер в статусе **Exited**

**Решение**:
1. Проверьте логи: **Containers** → **nfc-site** → **Logs**
2. Проверьте, что все переменные окружения заданы правильно
3. Убедитесь, что порт 10002 не занят другим приложением

### ❌ Ошибка подключения к базе данных

**Проблема**: В логах ошибка `ECONNREFUSED 10.19.0.1:3306`

**Решение**:
1. Проверьте, что MySQL сервер запущен на 10.19.0.1
2. Проверьте, что пользователь `nfc` создан с правами
3. Проверьте пароль (специальные символы должны быть экранированы)
4. Проверьте firewall на MySQL сервере

### ❌ Ошибка "Cannot find module"

**Проблема**: Ошибка при запуске `Cannot find module 'express'`

**Решение**:
1. Пересоберите образ: **Stacks** → **nfc-site** → **Editor** → **Update the stack** (с галочкой "Re-pull image and redeploy")
2. Или в консоли сервера:
```bash
docker-compose down
docker-compose up -d --build
```

### ❌ Healthcheck падает

**Проблема**: Контейнер в статусе **unhealthy**

**Решение**:
1. Увеличьте `start_period` в healthcheck до 120s
2. Проверьте, что `/api/health` endpoint отвечает:
```bash
docker exec nfc-site curl http://localhost:10002/api/health
```

## Обновление приложения

### Через Git (если используете Repository):

1. Закоммитьте изменения в Git
2. Выполните `git push`
3. В Portainer: **Stacks** → **nfc-site** → **Pull and redeploy** (если включен GitOps)
4. Или вручную: **Editor** → **Update the stack**

### Через Web Editor:

1. В Portainer: **Stacks** → **nfc-site** → **Editor**
2. Внесите изменения в `docker-compose.yml`
3. Нажмите **Update the stack**
4. Включите **Re-pull image and redeploy**

## Мониторинг в Portainer

В разделе **Containers** → **nfc-site** доступно:

- 📊 **Stats** - CPU, Memory, Network usage
- 📜 **Logs** - логи приложения в реальном времени
- 🔧 **Inspect** - полная информация о контейнере
- 🖥️ **Console** - доступ к терминалу контейнера

## Резервное копирование данных

Данные карточек хранятся в volume `./data`. Для бэкапа:

```bash
# На сервере
cd /var/lib/docker/volumes/
tar -czf nfc-data-backup-$(date +%Y%m%d).tar.gz nfc-site_data/

# Или через Portainer API
docker cp nfc-site:/app/data ./backup/data
```

## Поддержка

При возникновении проблем проверьте:
1. ✅ Логи контейнера в Portainer
2. ✅ Статус healthcheck
3. ✅ Подключение к базе данных
4. ✅ Переменные окружения
5. ✅ Сетевые настройки

---

**Готово!** Ваш NFC сайт теперь работает на `http://85.198.84.223:10002` 🎉


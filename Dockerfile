# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только package файлы
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем исходный код
COPY . .

# Если есть build скрипт - выполняем
RUN npm run build --if-present || true

# Stage 2: Runtime (меньший размер образа)
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимое из builder
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код и построенные файлы
COPY --from=builder /app .

EXPOSE 10002

CMD ["npm", "start"]

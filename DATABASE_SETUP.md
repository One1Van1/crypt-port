# Database Setup Guide

## Вариант 1: Docker (Рекомендуется)

### Установка Docker
1. Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop
2. Установите и запустите Docker Desktop

### Запуск базы данных
```bash
docker-compose up -d
```

### Проверка статуса
```bash
docker-compose ps
```

### Остановка базы данных
```bash
docker-compose down
```

### Просмотр логов
```bash
docker-compose logs -f postgres
```

---

## Вариант 2: Локальная установка PostgreSQL

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Создание базы данных
```bash
createdb crypt_port
```

### Настройка
После установки обновите `.env` файл с вашими учётными данными PostgreSQL.

---

## Проверка подключения

После запуска базы данных запустите backend:
```bash
cd backend
yarn start:dev
```

Если подключение успешно, вы увидите сообщение:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api/docs
```

---

## Swagger Documentation

После запуска приложения документация API доступна по адресу:
**http://localhost:3000/api/docs**

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и настройте:

```bash
cd backend
cp .env.example .env
```

Основные переменные:
- `DB_HOST` - хост базы данных (localhost)
- `DB_PORT` - порт базы данных (5432)
- `DB_USERNAME` - имя пользователя (postgres)
- `DB_PASSWORD` - пароль (postgres)
- `DB_DATABASE` - имя базы данных (crypt_port)

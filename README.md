# CRM P2P Processing System

Fullstack приложение для управления P2P-платежами на NestJS и React с TypeScript

## Технологии

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger / OpenAPI

### Frontend
- React
- TypeScript
- Vite

## Установка

### 1. Клонирование репозитория
```bash
git clone https://github.com/One1Van1/crypt-port.git
cd crypt-port
```

### 2. Установка зависимостей

#### Backend
```bash
cd backend
yarn install
cp .env.example .env
```

#### Frontend
```bash
cd frontend
yarn install
```

### 3. Запуск базы данных

**Docker (рекомендуется):**
```bash
docker-compose up -d
```

**Или локальная установка PostgreSQL:**
См. [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Запуск

### 🚀 Быстрый запуск (Рекомендуется)

**Метод 1: VS Code Task**
1. Нажмите `Cmd+Shift+P` (или F1)
2. Введите `Tasks: Run Task`
3. Выберите **"Поехали"**

Или скажите копилоту: *"Поехали"* или *"Запусти проект"*

**Метод 2: Bash скрипт**
```bash
./start-dev.sh
```

### 📝 Ручной запуск

#### Backend (порт 3000)
```bash
cd backend
yarn start:dev
```

#### Frontend (порт 5173)
```bash
cd frontend
yarn dev
```

📖 Подробная инструкция: см. [QUICK_START.md](QUICK_START.md)

## API Documentation

После запуска backend, Swagger документация доступна по адресу:
**http://localhost:3000/api/docs**

## Сборка production

### Backend
```bash
cd backend
yarn build
yarn start:prod
```

### Frontend
```bash
cd frontend
yarn build
yarn preview
```

## API

Backend доступен по адресу: `http://localhost:3000`
Frontend доступен по адресу: `http://localhost:5173`

API запросы с фронтенда автоматически проксируются на бэкенд через Vite proxy.

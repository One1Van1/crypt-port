# SRM Project

Fullstack приложение на NestJS и React с TypeScript

## Структура проекта

```
srm/
├── backend/          # NestJS Backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
└── frontend/         # React Frontend
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── App.css
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Технологии

### Backend
- NestJS
- TypeScript
- Express

### Frontend
- React
- TypeScript
- Vite

## Установка

Установка зависимостей уже выполнена. Если нужно переустановить:

### Backend
```bash
cd backend
yarn install
```

### Frontend
```bash
cd frontend
yarn install
```

## Запуск

### Backend (порт 3000)
```bash
cd backend
yarn start:dev
```

### Frontend (порт 5173)
```bash
cd frontend
yarn dev
```

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

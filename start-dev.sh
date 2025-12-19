#!/bin/bash

# Скрипт для запуска frontend и backend в режиме разработки

echo "🚀 Запуск Backend (NestJS)..."
cd backend && yarn start:dev &

echo "🎨 Запуск Frontend (React + Vite)..."
cd ../frontend && yarn dev &

echo "✅ Проект запущен!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Нажмите Ctrl+C для остановки всех процессов"

# Ожидание завершения процессов
wait

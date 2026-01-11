# Staging deploy (VPS + Docker + отдельная БД)

Цель: поднять окружение, куда заказчик зайдёт по URL и будет работать независимо от твоей локальной машины.

Стек: Postgres (Docker volume) + Backend (NestJS) + Frontend (Vite build → Nginx) + Caddy (TLS/HTTPS).

## 1) VPS и домены

1. Возьми VPS (Ubuntu 22.04/24.04).
2. Заведи DNS записи:
   - `APP_DOMAIN` → A запись на IP VPS (например `staging.example.com`)
   - `API_DOMAIN` → A запись на IP VPS (например `api.staging.example.com`)

## 2) Установка Docker на VPS

На VPS:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Docker repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
# перелогинься после этого
```

Проверка:

```bash
docker --version
docker compose version
```

## 3) Выкладка кода на VPS

Варианты:
- Git: `git clone ...` (лучше)
- Архивом: scp/rsync

## 4) Staging env

На VPS в корне проекта:

```bash
cp .env.staging.example .env.staging
nano .env.staging
```

Важно:
- пароли/секреты должны быть длинные и случайные
- `VITE_API_BASE_URL` должен совпадать с `API_DOMAIN`

## 5) Запуск стека

В корне проекта:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build
```

Проверка:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

## 6) Миграции и сиды

Прогнать миграции:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml exec backend yarn migration:run
```

Залить демо-данные (по необходимости):

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml exec backend yarn seed:all
```

## 7) Что дать заказчику

- URL фронта: `https://APP_DOMAIN`
- Учетки/роли внутри приложения (создай отдельные для заказчика)
- (Опционально) URL swagger: `https://API_DOMAIN/api/docs`

## 8) Бэкап базы (минимальный)

Самый простой ручной:

```bash
# в папке проекта
mkdir -p backups

docker compose --env-file .env.staging -f docker-compose.staging.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "backups/staging_$(date +%F).sql"
```

## 9) Типичные проблемы

- Caddy не выдал сертификат: проверь DNS A-записи и что порты 80/443 открыты.
- Фронт стучится в localhost: проверь `VITE_API_BASE_URL` в `.env.staging` и пересобери фронт `up -d --build`.
- Backend не коннектится к БД: проверь переменные `POSTGRES_*` и что `NODE_ENV` не равен `production` (иначе включится SSL к Postgres).

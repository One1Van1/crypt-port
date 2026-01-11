# Деплой с нуля: полная инструкция для первого раза

Это гайд для тех, кто никогда не поднимал сервер и не деплоил проекты.  
Цель: дать заказчику рабочий URL, где он может зайти и пользоваться приложением 24/7.

---

## Что тебе нужно купить/сделать

### 1) VPS (виртуальный сервер)
**Что это**: "компьютер в интернете", который работает 24/7.

**Где купить** (рекомендации для первого раза):
- **Hetzner** (Европа) — ~€5/месяц за 2 vCPU / 4 GB RAM / 40 GB SSD
  - https://www.hetzner.com/cloud
  - Простая панель, стабильно, недорого
- **DigitalOcean** (США/Европа) — $12/месяц за 2 vCPU / 2 GB RAM / 50 GB SSD
  - https://www.digitalocean.com/products/droplets
  - Простая панель, много гайдов
- **Timeweb Cloud** (РФ) — ~500₽/месяц за 2 vCPU / 2 GB RAM / 20 GB SSD
  - https://timeweb.cloud
  - Русская панель и поддержка

**Если ты в Южной Америке (например Аргентина): что выбрать**
- Лучший приоритет — датацентр ближе к вам, чтобы был нормальный пинг.
- Самый простой вариант для старта: **DigitalOcean, регион São Paulo (BR)**.
- Альтернатива (более “энтерпрайз”, но сложнее): **AWS São Paulo (sa-east-1)** / Google Cloud / Azure в Бразилии.
- **Hetzner** очень выгодный по цене, но чаще всего будет Европа/США → задержка выше (для staging часто ок, но если заказчик тоже в ЛатАм — лучше Бразилия).

**Рекомендованный тариф для твоего проекта (NestJS + Postgres + React):**
- Минимум: **2 vCPU / 2 GB RAM** (может хватить для демо)
- Комфортнее и меньше риск проблем при сборке Docker: **2 vCPU / 4 GB RAM**

**Что выбрать при создании VPS:**
- OS: **Ubuntu 22.04 LTS** или **Ubuntu 24.04 LTS**
- RAM: минимум **2 GB**, лучше **4 GB**
- CPU: минимум **2 vCPU**
- Disk: минимум **20 GB SSD**

**Что получишь после создания:**
- Публичный IP адрес (например `1.2.3.4`)
- Root password или SSH ключ для входа

---

### 2) Домен (опционально, но очень желательно)
**Что это**: человеческий адрес вроде `myapp.com` вместо `1.2.3.4`.

**Где купить** (рекомендации):
- **Namecheap** — https://www.namecheap.com (простая панель, ~$10/год)
- **Porkbun** — https://porkbun.com (часто дешевле, ~$8/год)
- **Cloudflare** — https://www.cloudflare.com/products/registrar (по себестоимости, но нужен аккаунт)
- **REG.RU** — https://www.reg.ru (если удобнее русская оплата)

**Какой домен купить:**
- Любой `.com` / `.net` / `.io` / `.ru` и т.д.
- Для staging можно даже самый простой и дешёвый

**Временная альтернатива (без покупки домена):**
Можешь использовать **sslip.io** или **nip.io** — это "бесплатные" домены на базе IP:
- Например если твой VPS IP = `1.2.3.4`, то можно:
  - `staging.1.2.3.4.sslip.io` → автоматически резолвится в `1.2.3.4`
  - `api.staging.1.2.3.4.sslip.io` → тоже в `1.2.3.4`
- Плюс: бесплатно, работает сразу, есть HTTPS
- Минус: выглядит не очень красиво, зависит от стороннего сервиса

---

## Пошаговый план деплоя

### Шаг 0: Подготовка локально (на твоём компе)

#### 0.1) Создай ветку staging в git
```bash
cd /Users/one.van/Desktop/crypt_port
git checkout main
git pull

git checkout -B staging
git merge main
git push -u origin staging
```

#### 0.2) Проверь что всё закоммичено
```bash
git status
```
Все файлы должны быть в git (особенно новые файлы: Dockerfile, docker-compose.staging.yml и т.д.).

---

### Шаг 1: Подключись к VPS

После создания VPS тебе дадут:
- IP адрес (например `1.2.3.4`)
- Root пароль или SSH ключ

#### Подключение по SSH:
```bash
ssh root@1.2.3.4
```
(или `ssh ubuntu@1.2.3.4` если создавал с пользователем ubuntu)

При первом входе скажет "unknown host" — набери `yes`.

---

### Шаг 2: Установка софта на VPS

Сейчас выполни команды по очереди на сервере (в SSH сессии).

#### 2.1) Обновление системы
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

#### 2.2) Установка Docker
```bash
sudo apt-get install -y ca-certificates curl gnupg git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### 2.3) Добавление пользователя в группу docker
```bash
sudo usermod -aG docker $USER
```

Теперь **перелогинься** (важно!):
```bash
exit
ssh root@1.2.3.4
```

Проверка:
```bash
docker --version
docker compose version
```

#### 2.4) Открытие портов (firewall)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

### Шаг 3: Доступ к GitHub с сервера (SSH deploy key)

Чтобы сервер мог делать `git clone` и `git pull` без пароля.

#### 3.1) Создай SSH ключ на VPS
```bash
ssh-keygen -t ed25519 -C "crypt-port-staging-vps" -f ~/.ssh/crypt-port-staging -N ""
```

#### 3.2) Покажи публичный ключ
```bash
cat ~/.ssh/crypt-port-staging.pub
```

Скопируй весь вывод (начинается с `ssh-ed25519 ...`).

#### 3.3) Добавь ключ в GitHub

В браузере:
1. Открой https://github.com/One1Van1/crypt-port
2. Settings → Deploy keys → **Add deploy key**
3. Title: `staging-vps`
4. Key: вставь то, что скопировал из `cat`
5. **Allow write access: НЕ ВКЛЮЧАЙ** (read-only достаточно)
6. Нажми **Add key**

#### 3.4) Настрой SSH config на VPS
```bash
cat > ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/crypt-port-staging
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config
```

#### 3.5) Проверка доступа
```bash
ssh -T git@github.com
```

Должно написать: `Hi One1Van1/crypt-port! You've successfully authenticated...`

---

### Шаг 4: DNS настройка (если купил домен)

Если используешь sslip.io/nip.io — пропусти этот шаг.

#### 4.1) В панели домена создай A-записи

Пример для домена `myapp.com` и VPS IP `1.2.3.4`:

**A record 1:**
- Type: `A`
- Host/Name: `staging`
- Value/Points to: `1.2.3.4`
- TTL: `300` или `Auto`

**A record 2:**
- Type: `A`
- Host/Name: `api.staging`
- Value/Points to: `1.2.3.4`
- TTL: `300` или `Auto`

Результат:
- `staging.myapp.com` → `1.2.3.4`
- `api.staging.myapp.com` → `1.2.3.4`

#### 4.2) Проверка DNS (на своём компе, не на VPS)
```bash
dig +short staging.myapp.com
dig +short api.staging.myapp.com
```

Должны вернуть IP твоего VPS. Может занять от 5 минут до пары часов.

---

### Шаг 5: Клонирование проекта на VPS

На VPS:
```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:One1Van1/crypt-port.git
cd crypt-port
git checkout staging
```

---

### Шаг 6: Настройка окружения (.env.staging)

#### 6.1) Скопируй шаблон
```bash
cp .env.staging.example .env.staging
```

#### 6.2) Сгенерируй секреты
```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 32)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
```

Скопируй эти значения.

#### 6.3) Отредактируй .env.staging
```bash
nano .env.staging
```

**Если купил домен** (например `myapp.com`):
```env
APP_DOMAIN=staging.myapp.com
API_DOMAIN=api.staging.myapp.com

POSTGRES_USER=crypt_port
POSTGRES_PASSWORD=<вставь сгенерированный>
POSTGRES_DB=crypt_port_staging

JWT_SECRET=<вставь сгенерированный>
JWT_EXPIRATION=7d

VITE_API_BASE_URL=https://api.staging.myapp.com
```

**Если используешь sslip.io** (VPS IP = `1.2.3.4`):
```env
APP_DOMAIN=staging.1.2.3.4.sslip.io
API_DOMAIN=api.staging.1.2.3.4.sslip.io

POSTGRES_USER=crypt_port
POSTGRES_PASSWORD=<вставь сгенерированный>
POSTGRES_DB=crypt_port_staging

JWT_SECRET=<вставь сгенерированный>
JWT_EXPIRATION=7d

VITE_API_BASE_URL=https://api.staging.1.2.3.4.sslip.io
```

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 7: Запуск staging

#### 7.1) Подними стек (фронт+бэк+БД+HTTPS)
```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build
```

Это займёт несколько минут (Docker качает образы, собирает backend и frontend).

#### 7.2) Проверка статуса
```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

Все сервисы должны быть в статусе `Up` (может занять 30-60 секунд).

#### 7.3) Прогони миграции БД
```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml exec -T backend yarn migration:run
```

#### 7.4) (Опционально) Залей тестовые данные
```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml exec -T backend yarn seed:all
```

---

### Шаг 8: Проверка работы

#### В браузере открой:
- Фронт: `https://staging.myapp.com` (или `https://staging.1.2.3.4.sslip.io`)
- API swagger: `https://api.staging.myapp.com/api/docs`

Если всё ок — увидишь интерфейс приложения и сможешь залогиниться.

#### Если что-то не работает — смотри логи:
```bash
# Логи Caddy (HTTPS/reverse proxy)
docker compose --env-file .env.staging -f docker-compose.staging.yml logs -f --tail=100 caddy

# Логи backend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs -f --tail=100 backend

# Логи frontend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs -f --tail=100 frontend

# Логи БД
docker compose --env-file .env.staging -f docker-compose.staging.yml logs -f --tail=100 postgres
```

---

## Как обновлять staging (когда делаешь изменения)

### На своём компе:
```bash
cd /Users/one.van/Desktop/crypt_port
git checkout staging
git merge main  # или делаешь изменения прямо в staging
git push origin staging
```

### На VPS:
```bash
cd ~/apps/crypt-port
./deploy/staging-update.sh
```

Этот скрипт делает:
1. `git pull` (staging)
2. Пересборка и перезапуск контейнеров
3. Миграции БД (если были изменения схемы)

---

## Типичные проблемы и решения

### 1) Caddy не выдаёт HTTPS сертификат
**Причины:**
- DNS ещё не обновился → подожди 10-30 минут, проверь `dig +short staging.myapp.com`
- Порты 80/443 закрыты → проверь `sudo ufw status` и security group у VPS провайдера

### 2) Backend не стартует / ошибка БД
**Проверь:**
- Логи: `docker compose ... logs backend`
- Правильность переменных в `.env.staging`
- Что БД запустилась: `docker compose ... ps postgres`

### 3) Фронт ходит не туда (localhost)
**Причина:** `VITE_API_BASE_URL` не задан или неправильный.
**Решение:**
- Проверь `.env.staging`
- Пересобери фронт: `docker compose ... up -d --build frontend`

### 4) "Permission denied" при `docker compose`
**Причина:** не перелогинился после добавления в группу docker.
**Решение:** `exit` и заново `ssh ...`

---

## Безопасность (минимум)

### 1) Basic Auth (опционально, для staging)
Если не хочешь, чтобы кто угодно зашёл по URL.

Отредактируй `Caddyfile.staging`:
```caddyfile
{$APP_DOMAIN} {
  encode gzip
  basicauth {
    staging $2a$14$xyz...  # генерируется через `caddy hash-password`
  }
  reverse_proxy frontend:80
}
```

Потом перезапусти: `docker compose ... restart caddy`

### 2) Регулярные бэкапы БД
```bash
# Ручной бэкап
docker compose --env-file .env.staging -f docker-compose.staging.yml exec -T postgres \
  pg_dump -U crypt_port crypt_port_staging > backup_$(date +%F).sql
```

Можно добавить в cron (на VPS):
```bash
crontab -e
```

Добавь строку (каждый день в 3:00):
```
0 3 * * * cd ~/apps/crypt-port && docker compose --env-file .env.staging -f docker-compose.staging.yml exec -T postgres pg_dump -U crypt_port crypt_port_staging > ~/backups/backup_$(date +\%F).sql
```

---

## Итого: что ты получил

✅ Рабочий staging на VPS с HTTPS  
✅ Отдельная БД (не твоя локальная)  
✅ Заказчик может заходить 24/7 по URL  
✅ Ты можешь обновлять одной командой `./deploy/staging-update.sh`  
✅ Локальная разработка не мешает staging

---

## Что дальше (опционально)

- **CI/CD**: GitHub Actions для автоматического деплоя при push в staging
- **Мониторинг**: простейший — `docker stats`, или Grafana + Prometheus
- **Blue/Green деплой**: обновления без даунтайма (для production)
- **Бэкап-стратегия**: авто-бэкапы + хранение в S3/Backblaze

Но для staging MVP этого достаточно!

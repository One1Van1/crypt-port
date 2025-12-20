# Система аутентификации с 2FA (Google Authenticator)

## 📋 Обзор

Полная система аутентификации с двухфакторной авторизацией через Google Authenticator.

## 🔐 Функциональность

### Роли пользователей
- **ADMIN** - Полный доступ, может управлять пользователями
- **TEAMLEAD** - Руководитель команды
- **OPERATOR** - Оператор
- **PENDING** - Ожидание одобрения (новые пользователи)

### Особенности
- ✅ Регистрация обычных пользователей (роль PENDING)
- ✅ Регистрация админа через MASTER_KEY
- ✅ Двухфакторная авторизация (Google Authenticator)
- ✅ JWT токены (Access + Refresh)
- ✅ Защита роли PENDING от авторизации
- ✅ Выдача ролей только админом

---

## 🚀 Endpoints

### 1. Регистрация обычного пользователя
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "pending",
  "status": "active",
  "message": "Registration successful. Waiting for admin approval to assign a role."
}
```

**Примечание:** Пользователь создается с ролью `PENDING` и не может авторизоваться до получения роли от админа.

---

### 2. Регистрация администратора
```http
POST /auth/register-admin
```

**Request Body:**
```json
{
  "masterKey": "super-secret-master-key-change-in-production",
  "username": "admin",
  "email": "admin@example.com",
  "password": "AdminSecurePass123!",
  "name": "Admin User"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "admin",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "status": "active",
  "message": "Admin successfully registered. Please set up 2FA."
}
```

**Примечание:** MASTER_KEY берется из переменной окружения `.env`.

---

### 3. Получение QR-кода для Google Authenticator
```http
GET /auth/qr-code
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "qrCodeUrl": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP",
  "message": "Scan QR code with Google Authenticator app"
}
```

**Примечание:** 
- QR-код нужно отсканировать в Google Authenticator
- `secret` можно ввести вручную, если QR-код не работает
- Этот endpoint требует аутентификации

---

### 4. Первый шаг авторизации (логин + пароль)
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (если роль PENDING):**
```json
{
  "statusCode": 403,
  "message": "Your account is pending approval. Please wait for admin to assign a role."
}
```

**Response (успешно):**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "uuid",
  "requires2FA": true,
  "message": "Please provide 2FA code to complete login"
}
```

**Примечание:** 
- `tempToken` действителен 5 минут
- Пользователи с ролью `PENDING` не могут войти
- `requires2FA` показывает, включен ли 2FA

---

### 5. Второй шаг авторизации (2FA код)
```http
POST /auth/verify-2fa
```

**Request Body:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "operator",
  "message": "Login successful"
}
```

**Примечание:** 
- Первая верификация включает 2FA автоматически
- Код из Google Authenticator обновляется каждые 30 секунд
- `accessToken` действителен 15 минут
- `refreshToken` действителен 7 дней

---

### 6. Получить информацию о текущем пользователе
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "operator",
  "status": "active",
  "twoFactorEnabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 7. Обновить токены
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Tokens refreshed successfully"
}
```

---

### 8. Выход
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Примечание:** Клиент должен удалить токены из storage.

---

### 9. Выдача роли пользователю (только админ)
```http
PATCH /admin/users/:id/role
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "role": "operator"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "role": "operator",
  "message": "User role updated successfully"
}
```

**Примечание:** 
- Требуется роль `ADMIN`
- Доступные роли: `admin`, `teamlead`, `operator`, `pending`

---

## 📱 Workflow регистрации и входа

### Для нового пользователя:

1. **Регистрация**
   ```
   POST /auth/register
   → Получает роль PENDING
   → Ждет одобрения админа
   ```

2. **Админ выдает роль**
   ```
   PATCH /admin/users/:id/role
   → Пользователь получает роль (например, operator)
   ```

3. **Первый вход (логин + пароль)**
   ```
   POST /auth/login
   → Получает tempToken
   ```

4. **Получение QR-кода для 2FA**
   ```
   Сначала нужно получить access_token
   Но для этого нужно пройти 2FA...
   ```

   **ВАЖНО:** Для первого входа:
   - После регистрации пользователь должен использовать секрет из базы
   - Или админ может предоставить временный доступ для получения QR-кода

5. **Завершение входа с 2FA**
   ```
   POST /auth/verify-2fa
   → Вводит код из Google Authenticator
   → Получает access и refresh токены
   → 2FA автоматически активируется
   ```

### Для админа:

1. **Регистрация через MASTER_KEY**
   ```
   POST /auth/register-admin
   → Сразу получает роль ADMIN
   ```

2. **Логин**
   ```
   POST /auth/login
   → tempToken
   ```

3. **Получение QR-кода** (после первого входа)
   ```
   GET /auth/qr-code (требует токен)
   ```

4. **Верификация 2FA**
   ```
   POST /auth/verify-2fa
   → Полный доступ
   ```

---

## 🔧 Переменные окружения

```env
# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=7d

# Master Key для админа
MASTER_KEY=super-secret-master-key-change-in-production
```

---

## 🛡️ Защита endpoints

### Публичные endpoints (без токена):
- `POST /auth/register`
- `POST /auth/register-admin`
- `POST /auth/login`
- `POST /auth/verify-2fa`
- `POST /auth/refresh`

### Защищенные endpoints (требуют токен):
- `GET /auth/me`
- `GET /auth/qr-code`
- `POST /auth/logout`

### Только для админа:
- `PATCH /admin/users/:id/role`

---

## 📊 Swagger документация

Доступна по адресу: `http://localhost:3000/api/docs`

---

## ⚠️ Важные примечания

1. **PENDING пользователи не могут войти** - они должны сначала получить роль от админа
2. **2FA обязателен** - все пользователи должны настроить Google Authenticator
3. **MASTER_KEY храните в секрете** - только для создания первого админа
4. **Токены:**
   - Access token: 15 минут
   - Refresh token: 7 дней
   - Temp token (для 2FA): 5 минут

---

## 🧪 Тестирование

### Создание первого админа:
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "masterKey": "super-secret-master-key-change-in-production",
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "Main Admin"
  }'
```

### Регистрация пользователя:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@example.com",
    "password": "User123!",
    "name": "Test User"
  }'
```

### Логин:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

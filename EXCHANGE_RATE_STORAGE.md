# 💱 Курс обмена и USDT эквивалент в нео-банках

## Дата: 4 января 2026 г.

---

## ❓ Проблема

**Вопрос**: Почему в нео-банках записана только сумма в песо (`currentBalance`), но не записано сколько это в USDT по курсу их платформы?

**Ответ**: Действительно была проблема! Раньше USDT эквивалент вычислялся динамически через поиск последнего обмена `UsdtToPesoExchange`, что было:
- ❌ Медленно (N+1 запросы)
- ❌ Ненадежно (может не найти обмен)
- ❌ Неточно (курс мог измениться)

---

## ✅ Решение

Теперь **в момент пополнения** нео-банка мы сохраняем:

### Новые поля в `DropNeoBank`:

```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'exchange_rate' })
exchangeRate: number;  // Курс на момент пополнения

@Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'usdt_equivalent' })
usdtEquivalent: number;  // Эквивалент в USDT
```

---

## 🔄 Как это работает

### 1️⃣ **Пополнение нео-банка** (Админ: USDT → ARS)

**Endpoint**: `POST /admin/exchange-usdt-to-pesos`

**Логика**:
```typescript
// Платформа: Binance, курс 1,100 ARS/USDT
// Отправляем: 500 USDT

const pesosAmount = 500 * 1100 = 550,000 ARS;

neoBank.currentBalance = 0 + 550,000 = 550,000 ARS;
neoBank.exchangeRate = 1100;  // ✨ СОХРАНЯЕМ КУРС!
neoBank.usdtEquivalent = 550,000 / 1100 = 500 USDT;  // ✨ СОХРАНЯЕМ USDT!
```

**Результат**:
```json
{
  "currentBalance": 550000,
  "exchangeRate": 1100,
  "usdtEquivalent": 500,
  "platformId": 1  // Binance
}
```

---

### 2️⃣ **Вывод с нео-банка** (Оператор → Физ банк)

**Endpoint**: `POST /transactions`

**Логика**:
```typescript
// Переводим 100,000 ARS на физ банк

neoBank.currentBalance = 550,000 - 100,000 = 450,000 ARS;

// Пересчитываем USDT эквивалент ПО ТОМУ ЖЕ КУРСУ!
if (neoBank.exchangeRate > 0) {
  neoBank.usdtEquivalent = 450,000 / 1100 = 409.09 USDT;
}
```

**Результат**:
```json
{
  "currentBalance": 450000,
  "exchangeRate": 1100,  // НЕ МЕНЯЕТСЯ!
  "usdtEquivalent": 409.09
}
```

---

### 3️⃣ **Расчет рабочего депозита**

**Endpoint**: `GET /working-deposit/sections`

**Старая логика** (❌):
```typescript
// Для каждого нео-банка ищем последний обмен
const latestExchange = await findOne({
  where: { neoBankId: neoBank.id },
  order: { createdAt: 'DESC' }
});

const rate = latestExchange?.exchangeRate || 1100; // fallback
const balanceUsdt = balance / rate;
```

**Новая логика** (✅):
```typescript
// Просто берем сохраненные значения!
const rate = neoBank.exchangeRate || 1100; // fallback если старые записи
const balanceUsdt = neoBank.usdtEquivalent || (balance / rate);
```

**Преимущества**:
- ✅ **Быстро** - нет дополнительных запросов
- ✅ **Точно** - курс зафиксирован на момент пополнения
- ✅ **Надежно** - всегда есть значение

---

## 📊 Пример полного цикла

### Сценарий:

```
День 1: Админ пополняет нео-банк
  Platform: Binance
  Курс: 1,100 ARS/USDT
  USDT: 500
  ───────────────────
  Neo-bank:
    currentBalance: 550,000 ARS
    exchangeRate: 1,100
    usdtEquivalent: 500 USDT
    platformId: 1 (Binance)

День 2: Курс меняется на Binance → 1,150 ARS/USDT
  Neo-bank ВСЕ ЕЩЕ:
    exchangeRate: 1,100  ← НЕ МЕНЯЕТСЯ!
    usdtEquivalent: 500 USDT  ← ПРАВИЛЬНО!
  
  Почему? Потому что нео-банк пополнен ПО КУРСУ 1,100!

День 3: Оператор выводит 100,000 ARS
  Neo-bank:
    currentBalance: 450,000 ARS
    exchangeRate: 1,100  ← ВСЕ ЕЩЕ НЕ МЕНЯЕТСЯ!
    usdtEquivalent: 409.09 USDT  ← Пересчет по тому же курсу

День 4: Рабочий депозит
  Unpaid Pesos:
    Neo-bank "rplo": 450,000 ARS
    Platform: Binance
    Rate: 1,100  ← ЗАФИКСИРОВАН
    USDT: 409.09  ← ТОЧНО
```

---

## 🎯 Зачем это нужно?

### Проблема курсов:

Если админ отправил 500 USDT с Binance по курсу 1,100:
```
500 USDT * 1,100 = 550,000 ARS
```

Потом курс на Binance изменился на 1,150. Если бы мы считали динамически:
```
550,000 ARS / 1,150 = 478.26 USDT  ❌ НЕПРАВИЛЬНО!
```

**Правильно**: Эти 550,000 ARS всегда равны **500 USDT**, потому что были получены именно по курсу 1,100!

### Аналогия:

Это как если ты обменял $500 на рубли по курсу 80:
- Получил: 40,000 ₽
- Курс изменился на 90
- Но у тебя все равно 40,000 ₽ = $500 (по курсу ОБМЕНА, а не текущему!)

---

## 📝 Изменения в коде

### 1️⃣ Entity: `DropNeoBank`

**Добавлено**:
```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'exchange_rate' })
exchangeRate: number;

@Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'usdt_equivalent' })
usdtEquivalent: number;
```

### 2️⃣ Миграция: `AddRateToDropNeoBank1767546000000`

**Файл**: `backend/src/migrations/*-AddRateToDropNeoBank.ts`

**Добавляет**:
- `exchange_rate` DECIMAL(10,2) nullable
- `usdt_equivalent` DECIMAL(15,4) nullable

### 3️⃣ Service: `exchange-usdt-to-pesos.service.ts`

**Было**:
```typescript
neoBank.currentBalance += pesosAmount;
```

**Стало**:
```typescript
neoBank.currentBalance += pesosAmount;
neoBank.exchangeRate = platform.exchangeRate;  // ✨
neoBank.usdtEquivalent = neoBank.currentBalance / platform.exchangeRate;  // ✨
```

### 4️⃣ Service: `create.service.ts` (транзакции)

**Было**:
```typescript
sourceNeoBank.currentBalance -= dto.amount;
```

**Стало**:
```typescript
sourceNeoBank.currentBalance -= dto.amount;

// Пересчитываем USDT эквивалент
if (sourceNeoBank.exchangeRate > 0) {
  sourceNeoBank.usdtEquivalent = sourceNeoBank.currentBalance / sourceNeoBank.exchangeRate;
}
```

### 5️⃣ Service: `get-sections.service.ts` (рабочий депозит)

**Было**:
```typescript
const latestExchange = await findOne(...);  // N+1 запрос!
const rate = latestExchange?.exchangeRate || 1100;
const balanceUsdt = balance / rate;
```

**Стало**:
```typescript
const rate = neoBank.exchangeRate || 1100;  // Сохраненный курс
const balanceUsdt = neoBank.usdtEquivalent || (balance / rate);  // Прямое значение
```

---

## 🔍 Для старых данных

Что с нео-банками, которые созданы **до** этого изменения?

**Решение**: `nullable: true` + fallback логика:

```typescript
const rate = neoBank.exchangeRate || 1100;  // Дефолтный курс
const balanceUsdt = neoBank.usdtEquivalent || (balance / rate);  // Вычислим если нет
```

Можно создать скрипт миграции данных, который:
1. Найдет все нео-банки без `exchangeRate`
2. Найдет последний `UsdtToPesoExchange` для каждого
3. Заполнит `exchangeRate` и `usdtEquivalent`

---

## ✅ Итого

| До | После |
|----|-------|
| ❌ Динамический расчет | ✅ Сохраненное значение |
| ❌ N+1 запросы к UsdtToPesoExchange | ✅ Прямое чтение из DropNeoBank |
| ❌ Может не найти курс | ✅ Всегда есть курс (или fallback) |
| ❌ Неточность при смене курса | ✅ Зафиксированный курс обмена |

**Статус**: Готово к применению миграции ✅

**Миграции к применению**:
1. `1767543595000-AddPlatformToDropNeoBank.ts`
2. `1767545659000-CreateNeoBankWithdrawals.ts`
3. `*-AddRateToDropNeoBank.ts` ← **НОВАЯ**

**Команда**:
```bash
cd backend
yarn typeorm migration:run -d src/config/database.config.ts
```

# 💰 Движение денег в системе - Полная карта

## 🎯 Цель документа
Проверка работы рабочего депозита на фронтенде. Все endpoints и entities задокументированы.

---

## ✅ Проверка логики проекта

### **Шаг 1: Площадка → Нео-банк** (Админ: USDT → ARS)

**Entity**: `UsdtToPesoExchange` ✅

**Структура**:
```typescript
- platformId: number          // С какой площадки (Binance/Bybit)
- neoBankId: number          // На какой нео-банк
- usdtAmount: number         // Сколько USDT отправили
- exchangeRate: number       // Курс обмена
- pesosAmount: number        // Сколько ARS получили
- createdByUserId: number    // Кто сделал (админ)
```

**Endpoint**: `POST /admin/exchange-usdt-to-pesos` ✅

**Что происходит**:
- ✅ USDT уменьшается на `Balance` (platformId)
- ✅ ARS увеличивается на `DropNeoBank` (currentBalance)
- ✅ Создается запись `UsdtToPesoExchange` для истории

**Пример**:
```
Binance: 9,500 USDT → -500 USDT
Neo-bank "rplo": 0 ARS → +550,000 ARS (курс 1,100)
```

---

### **Шаг 2: Нео-банк → Физ банк** (Оператор: ARS → ARS)

**Entity**: `Transaction` ✅

**Структура**:
```typescript
- amount: number                    // Сумма в ARS
- sourceDropNeoBankId: number      // С какого нео-банка ← КЛЮЧ!
- bankAccountId: number            // На какой физ банк
- status: TransactionStatus        // PENDING/COMPLETED
- userId: number                   // Какой оператор создал
- exchangeRate: number             // Курс (для учета)
```

**Endpoint**: `POST /transactions` ✅

**Что происходит**:
- ✅ ARS уменьшается на `DropNeoBank` (sourceDropNeoBankId)
- ✅ ARS увеличивается на `BankAccount` (bankAccountId)
- ✅ Лимит реквизита уменьшается (`limitAmount` на `BankAccount`)
- ✅ Создается `Transaction` со статусом `PENDING`

**Пример**:
```
Neo-bank "rplo": 550,000 ARS → -100,000 ARS
Bank "Sberbank": 0 ARS → +100,000 ARS
Лимит реквизита: 500,000 → 400,000 ARS
```

---

### **Шаг 3: Физ банк → Free USDT** (Тимлид обналичивает: ARS → USDT)

**Entity**: `PesoToUsdtConversion` ✅

**Структура**:
```typescript
- pesosAmount: number              // Сколько песо обналичили
- exchangeRate: number             // По какому курсу
- usdtAmount: number               // Сколько USDT получилось
- convertedByUserId: number        // Кто обналичил (тимлид)
- cashWithdrawalId: number         // Связь с заявкой на вывод
```

**Endpoint**: `POST /cash-withdrawals/:id/convert-to-usdt` ✅

**Предварительный шаг**: `POST /cash-withdrawals/withdraw` создает заявку `CashWithdrawal` со статусом `pending`

**Что происходит**:
- ✅ Создается `PesoToUsdtConversion` (песо → USDT)
- ✅ `CashWithdrawal.status` меняется на `converted`
- ✅ Free USDT увеличивается (вычисляемое значение)

**Формула Free USDT**:
```
Free USDT = Σ(все PesoToUsdtConversion.usdtAmount) 
          - Σ(все Profit.withdrawnUsdt)
```

**Пример**:
```
Bank "Sberbank": 100,000 ARS
Курс: 1,150 ARS/USDT
Free USDT: 0 → +86.96 USDT (100,000 / 1,150)
```

---

### **Шаг 4: Free USDT → Profit/Platform** (Админ)

#### **4A) Вывод профита**

**Entity**: `Profit` ✅

**Структура**:
```typescript
- withdrawnUsdt: number                // Сколько USDT вывели как прибыль
- adminRate: number                    // Курс для конвертации в песо
- profitPesos: number                  // Сколько песо получилось
- returnedToSection: string            // Куда вернули песо
- returnedAmountPesos: number          // Сколько песо вернулось
- createdByUserId: number              // Админ
```

**Endpoint**: `POST /profits/withdraw` ✅

**Что происходит**:
- ✅ Создается запись `Profit`
- ✅ Free USDT уменьшается на `withdrawnUsdt`
- ✅ Песо возвращаются в систему (blocked_pesos или unpaid_pesos)

**Пример**:
```
Free USDT: 86.96 → -50 USDT
Профит: +50 USDT выведено
Возврат: 57,500 ARS в blocked_pesos (курс 1,150)
```

---

#### **4B) Возврат на платформу**

**Entity**: `Balance` ✅

**Endpoint**: `PATCH /balances/:id/adjust` ✅

**Структура запроса**:
```typescript
{
  adjustment: number,  // +100 (добавить) или -100 (вычесть)
  reason: string       // Причина изменения
}
```

**Что происходит**:
- ✅ USDT добавляется обратно на `Balance` платформы
- ✅ Free USDT логически уменьшается (вручную)

**Пример**:
```
Free USDT: 36.96 USDT (остаток)
Binance Balance: 9,000 → +36.96 = 9,036.96 USDT
```

---

## 📊 Итоговая карта: Полный цикл

```
┌─────────────────────────────────────────────────────────────────┐
│                    💎 Platform Balance                           │
│                   9,500 USDT (начало)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Шаг 1: POST /admin/exchange-usdt-to-pesos
                             │ -500 USDT → +550,000 ARS (курс 1,100)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🏦 DropNeoBank (Neo-bank)                     │
│                   550,000 ARS (status: ACTIVE)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Шаг 2: POST /transactions
                             │ -100,000 ARS (sourceDropNeoBankId)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🏪 BankAccount (Физ банк)                     │
│                   100,000 ARS (лимит -100k)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Шаг 3: POST /cash-withdrawals/:id/convert-to-usdt
                             │ 100,000 ARS / 1,150 = 86.96 USDT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ✨ Free USDT (виртуальная зона)               │
│                   86.96 USDT (вычисляемое)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├──► Шаг 4A: POST /profits/withdraw
                             │    -50 USDT → профит выведен
                             │    +57,500 ARS вернулись в систему
                             │
                             └──► Шаг 4B: PATCH /balances/:id/adjust
                                  +36.96 USDT → обратно на Platform
```

---

## 🎯 Что проверяем на фронтенде

### ✅ График рабочего депозита должен показывать:

1. **Platform Balances** 💎
   - USDT на Binance/Bybit
   - Должен уменьшаться при Шаге 1
   - Должен увеличиваться при Шаге 4B

2. **Blocked Pesos** 🔒
   - Замороженные нео-банки (status = FROZEN)
   - Должен увеличиваться когда дроп завершается
   - Должен уменьшаться при конвертации

3. **Unpaid Pesos** ⏳
   - Активные нео-банки (status = ACTIVE) ← Шаг 1-2
   - Pending транзакции ← Шаг 2
   - Деньги "в работе"

4. **Free USDT** 💵
   - Конвертации минус выводы ← Шаг 3-4
   - Формула: `Σ PesoToUsdtConversion - Σ Profit`

5. **Deficit** ⚠️
   - Pending cash withdrawals
   - Временно изъятые деньги

### ✅ Итоговая формула:

```
Total = Platform + Blocked + Unpaid + Free - Deficit
Profit = Total - Initial Deposit
```

---

## 🔍 Тестовый сценарий

1. ✅ Установить Initial Deposit: **9,500 USDT**
2. ✅ Запустить seed-скрипт: `yarn seed:working-deposit`
3. ✅ Проверить график:
   - Platform: ~9,416 USDT
   - Unpaid: ~1,800,000 ARS (в USDT)
   - Total: ~11,000 USDT
   - Profit: ~+1,500 USDT

4. ✅ Проверить историю (7/30/90 дней)
5. ✅ Проверить Pie Chart (распределение)
6. ✅ Проверить Bar Chart (сравнение секций)

---

## 📝 Примечания

- **UsdtToPesoExchange** и **PesoToUsdtConversion** - разные сущности!
  - UsdtToPesoExchange: USDT → Песо (админ отправляет на нео-банк)
  - PesoToUsdtConversion: Песо → USDT (тимлид обналичивает)

- **Transaction.sourceDropNeoBankId** - ключевое поле для связи перевода с нео-банком

- **Free USDT** - виртуальная величина, физически деньги могут быть где угодно

- **CashWithdrawal** - промежуточная сущность перед конвертацией (заявка на забор наличных)

---

**Дата проверки**: 4 января 2026 г.
**Статус**: Готов к тестированию на фронтенде ✅

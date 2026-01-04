# 🔄 Как работают транзакции в системе

## Дата: 4 января 2026 г.

---

## ❓ Вопросы и ответы

### 1️⃣ Как у нас работают транзакции?

**Ответ**: Транзакции создаются оператором для записи перевода денег с нео-банка на физический банк.

**Процесс**:

1. **Оператор начинает смену** → `POST /shifts/start`
2. **Оператор создает транзакцию** → `POST /transactions`
   - Указывает: `sourceDropNeoBankId` (откуда), `amount` (сколько), `receipt` (чек)
   - Система автоматически выбирает подходящий физический банк
3. **Система выполняет**:
   - ✅ Проверяет активность нео-банка
   - ✅ Проверяет достаточность средств на нео-банке
   - ✅ Находит доступный физ банк по приоритету
   - ✅ **Вычитает сумму из нео-банка** (`currentBalance` - `amount`)
   - ✅ Добавляет сумму на физ банк (`withdrawnAmount` + `amount`)
   - ✅ Уменьшает лимит реквизита
   - ✅ Создает запись `NeoBankWithdrawal` (история вывода)
   - ✅ Уменьшает `Balance` платформы
   - ✅ Обновляет статистику смены

**Endpoint**: `POST /transactions`

**DTO**:
```typescript
{
  sourceDropNeoBankId: string,  // UUID нео-банка
  amount: number,               // Сумма в ARS
  receipt: string,              // Ссылка на чек (скриншот)
  comment?: string              // Комментарий (опционально)
}
```

---

### 2️⃣ Реквизиты у нас выдаются по приоритету?

**Ответ**: ✅ **ДА!** Реквизиты (физические банки) выдаются строго по приоритету.

**Логика выбора**:

```sql
SELECT * FROM bank_accounts
WHERE status = 'WORKING'
  AND drop_id = :dropId
  AND (limit_amount - withdrawn_amount) >= :amount
ORDER BY 
  priority ASC,           -- 1️⃣ Сначала по приоритету (меньше = важнее)
  last_used_at ASC        -- 2️⃣ Потом по давности использования (NULLS FIRST)
LIMIT 1
```

**Пример**:
```
Bank 1: priority = 1, last_used_at = 2024-01-01 → выберется первым
Bank 2: priority = 1, last_used_at = 2024-01-03
Bank 3: priority = 2, last_used_at = NULL
Bank 4: priority = 2, last_used_at = 2024-01-02
```

**Важно**: Реквизиты должны быть из **того же дропа**, что и нео-банк!

---

### 3️⃣ Нео-банки у нас выдаются только те, которые привязаны к площадкам?

**Ответ**: ✅ **ДА!** Нео-банки теперь привязаны к платформам через `platformId`.

**Entity**: `DropNeoBank`

```typescript
@Column({ name: 'platform_id', nullable: true })
platformId: number;

@ManyToOne(() => Platform)
@JoinColumn({ name: 'platform_id' })
platform: Platform;
```

**Зачем**: Когда админ делает обмен USDT → ARS, он указывает:
- С какой платформы (Binance/Bybit)
- На какой нео-банк

При этом нео-банк получает `platformId`, чтобы знать, куда вернутся USDT после конвертации.

**Миграция**: `1767543595000-AddPlatformToDropNeoBank.ts` ✅ (создана)

---

### 4️⃣ Из нео-банков вычитывается сумма при переводе?

**Ответ**: ✅ **ТЕПЕРЬ ДА!** (исправлено)

**Было**: ❌ Сумма НЕ вычиталась из `currentBalance`

**Стало**: ✅ При создании транзакции:
```typescript
const balanceBefore = Number(sourceNeoBank.currentBalance);
sourceNeoBank.currentBalance = balanceBefore - dto.amount;
await queryRunner.manager.save(sourceNeoBank);
```

**Пример**:
```
Neo-bank "rplo": 550,000 ARS
Транзакция: -100,000 ARS
Результат: 450,000 ARS
```

---

### 5️⃣ Есть ли сущность для записи выводов с нео-банков?

**Ответ**: ✅ **ТЕПЕРЬ ДА!** (создана)

**Entity**: `NeoBankWithdrawal` ✅

**Структура**:
```typescript
- amount: number                 // Сумма вывода в ARS
- neoBankId: string             // С какого нео-банка
- bankAccountId: string         // На какой физ банк
- transactionId: string         // Связь с транзакцией
- withdrawnByUserId: string     // Кто сделал вывод (оператор)
- balanceBefore: number         // Баланс до вывода
- balanceAfter: number          // Баланс после вывода
- comment: string               // Комментарий
- createdAt: timestamp          // Когда
```

**Миграция**: `1767545659000-CreateNeoBankWithdrawals.ts` ✅ (создана)

**Таблица**: `neo_bank_withdrawals`

**Foreign Keys**:
- `neo_bank_id` → `drop_neo_banks.id`
- `bank_account_id` → `bank_accounts.id`
- `transaction_id` → `transactions.id`
- `withdrawn_by_user_id` → `users.id`

---

## 📊 Полная схема создания транзакции

```
┌─────────────────────────────────────────────────────┐
│  1️⃣ Проверки                                         │
│  • Активная смена оператора?                        │
│  • Нео-банк существует и ACTIVE?                    │
│  • Достаточно средств на нео-банке?                 │
│  • Курс платформы установлен?                       │
│  • Balance платформы достаточен?                    │
│  • Есть доступный физ банк с лимитом?               │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  2️⃣ Создание транзакции (Transaction)               │
│  • amount: 100,000 ARS                              │
│  • amountUSDT: 86.96 USDT (курс 1,150)             │
│  • status: COMPLETED                                │
│  • sourceDropNeoBank: rplo                          │
│  • bankAccount: Sberbank (автовыбор)               │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  3️⃣ Обновление физ банка (BankAccount)              │
│  • withdrawnAmount: +100,000 ARS                    │
│  • lastUsedAt: NOW                                  │
│  • Если лимит исчерпан → status = BLOCKED           │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  4️⃣ Обновление платформы (Balance)                  │
│  • amount: -86.96 USDT                              │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  5️⃣ Вычитание из нео-банка (DropNeoBank) ✨ NEW     │
│  • currentBalance: 550,000 → 450,000 ARS            │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  6️⃣ Создание записи вывода (NeoBankWithdrawal) ✨  │
│  • amount: 100,000 ARS                              │
│  • balanceBefore: 550,000                           │
│  • balanceAfter: 450,000                            │
│  • withdrawnByUser: operator_id                     │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  7️⃣ Обновление смены (Shift)                        │
│  • operationsCount: +1                              │
│  • totalAmount: +100,000 ARS                        │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Что изменилось

### ✅ Добавлено:

1. **Entity**: `NeoBankWithdrawal`
   - Файл: `backend/src/entities/neo-bank-withdrawal.entity.ts`
   - Таблица: `neo_bank_withdrawals`

2. **Миграция**: `CreateNeoBankWithdrawals1767545659000`
   - Файл: `backend/src/migrations/1767545659000-CreateNeoBankWithdrawals.ts`

3. **Логика вычитания** в `create.service.ts`:
   - Проверка достаточности средств на нео-банке
   - Вычитание суммы: `currentBalance -= amount`
   - Создание записи `NeoBankWithdrawal`

### ✅ Миграции к применению:

1. `1767543595000-AddPlatformToDropNeoBank.ts` - добавляет `platform_id` к нео-банкам
2. `1767545659000-CreateNeoBankWithdrawals.ts` - создает таблицу `neo_bank_withdrawals`

**Команда**:
```bash
cd backend
yarn typeorm migration:run -d src/config/database.config.ts
```

---

## 📝 Итоговые ответы

| Вопрос | Ответ | Статус |
|--------|-------|--------|
| Как работают транзакции? | Оператор создает, система вычитает из нео-банка и добавляет на физ банк | ✅ |
| Реквизиты по приоритету? | Да, сортировка: priority ASC, last_used_at ASC | ✅ |
| Нео-банки привязаны к платформам? | Да, через platformId | ✅ |
| Вычитается из нео-банка? | **Теперь ДА!** (исправлено) | ✅ |
| Есть сущность для выводов? | **Теперь ДА!** NeoBankWithdrawal | ✅ |

---

**Статус**: Готово к применению миграций ✅
**Дата**: 4 января 2026 г.

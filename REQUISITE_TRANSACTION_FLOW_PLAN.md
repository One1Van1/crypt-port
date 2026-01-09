# План: Get Requisite → Transaction → History (исключить нео-банки из депозита)

Дата: 2026-01-08

## Статус
- ✅ Отдельный расчёт депозита/секций без нео-банков уже добавлен: `GET /working-deposit/sections-ledger-v2`.
- ⏸️ Фронтенд не трогаем (по договорённости), только backend.

## Цели
1. Перестать использовать `drop_neo_banks.current_balance` как источник «рабочего депозита».
2. «Получить реквизит» (endpoint для GetRequisiteModal) должен отдавать по нео-банкам **лимиты и alias**, а не баланс.
3. «Транзакция» должна автоматически:
   - определить platform по активной смене,
   - посчитать `usdtDelta` из введённых ARS,
   - уменьшить `platform.balance` на `usdtDelta`,
  - провести сумму через нео-банк для истории (platform → neo-bank → bank),
   - увеличить `bank_accounts.withdrawn_amount` на ARS,
   - записать историю через `neo_bank_withdrawals` (как сейчас принято в проекте).
4. Все изменения + история делаются в одной DB-транзакции.

## Ограничения
- "Никогда не трогай старое, только добавляй новое":
  - новые endpoints/flows — отдельными actions в `backend/src/features/...`.
  - существующие endpoints не переименовывать/не ломать.

## Уточнения (зафиксировано)
- Сумма транзакции, вводимая оператором — **ARS**.
- Баланс реквизита (физ банка), который нужно увеличивать — **`bank_accounts.withdrawn_amount`**.
- Историю по площадкам уже ведём «как сейчас»; для `neo_bank_withdrawals` использовать существующую модель «как есть».

---

## 1) Инвентаризация текущего флоу

### 1.1 Найти «Получить реквизит»
- Найти endpoint/сервис, который используется фронтом в GetRequisiteModal.
- Зафиксировать контракт ответа:
  - что возвращается по текущей смене (platformId/platform?),
  - физ. реквизит банка (`bankAccount`?),
  - список нео-банков (`dropNeoBanks`?) и правила фильтрации.

### 1.2 Найти «Создать транзакцию»
- Найти endpoint/сервис создания транзакции.
- Зафиксировать:
  - какие поля реально обновляются сейчас (platform.balance? bank_accounts.withdrawn_amount? neo-bank balance?),
  - какая часть сейчас считается «депозитом» и где учитываются балансы.

**Артефакт шага:** короткий блок в конце этого файла «Найдено в коде» с путями и кратким описанием.

---

## 2) Данные и модель истории (без удаления currentBalance)

### 2.1 Нео-банк balance остаётся, но не участвует в депозите
- `drop_neo_banks.current_balance` остаётся в БД и в entity.
- В новых расчётах не использовать currentBalance как часть рабочего депозита.
- При создании транзакции допускается временно изменять currentBalance (увеличить/уменьшить в рамках одной DB-транзакции), чтобы зафиксировать факт «деньги проходили через нео-банк» для истории/аудита.

### 2.2 История перемещения
Предпочтение: **использовать существующую `neo_bank_withdrawals`**.
- Каждая транзакция должна порождать запись вида:
  - «списали с нео-банка в пользу реквизита физ. банка»
  - + ссылки на `platformId`/`shiftId`/`transactionId` (если поля уже есть; если нет — обсуждаем, но по правилу “добавляй новое”: либо добавить nullable колонки миграцией, либо отдельный журнал).

Альтернатива (если `neo_bank_withdrawals` не подходит по полям/смыслу):
- создать отдельный журнал перемещений (новая таблица + entity + миграция).

### 2.3 Транзакционность
- Все обновления (platform, bankAccount, история) делать в одной TypeORM транзакции.

---

## 3) «Получить реквизит»: показываем лимиты вместо баланса

### 3.1 Изменения в ответе (backend)
- В объекте нео-банка отдавать:
  - `dailyLimit`, `monthlyLimit`, `alias`, `provider`, `accountId` (+ id, platformId, dropId если нужно для выбора)
- Не отдавать/не использовать `currentBalance` как «баланс для выбора».

### 3.2 Фильтрация
- Оставить существующую фильтрацию списка нео-банков:
  - по платформе активной смены,
  - остальные правила выбора — как сейчас.

*Фронт не меняем*, но контракт готовим так, чтобы UI мог отобразить лимиты.

---

## 4) Транзакция: автоматическое движение денег

### 4.1 Определение platform
- Platform определяется по активной смене пользователя (как при «получить реквизит»).

### 4.2 Формула конвертации
- Ввод: `arsAmount`.
- Курс: `platform.exchangeRate`.
- `usdtDelta = arsAmount / platform.exchangeRate`.

### 4.3 Изменение балансов
- `platform.balance -= usdtDelta`.
- `drop_neo_banks.current_balance += arsAmount` (промежуточно, для истории; не для депозита).
- `bankAccount.withdrawn_amount += arsAmount`.
- `drop_neo_banks.current_balance -= arsAmount` (сразу после фиксации истории; итоговый баланс может не измениться).

### 4.4 История
- Записать историю через `neo_bank_withdrawals`:
  - откуда: `neoBankId`
  - куда: `bankAccountId`
  - сколько: ARS и/или USDT, курс, `shiftId`, `transactionId`.

Примечание:
- История по площадкам (списание `platform.balance`) ведётся «как сейчас» существующими механизмами проекта.

### 4.5 Проверки
- Достаточно ли USDT на платформе для `usdtDelta`.
- Валидация лимитов (если должны ограничивать операцию) — **отдельно уточняем/в следующем таске**. Сейчас в рамках текущего — только отображение лимитов.

---

## 5) План реализации (backend, строго «добавляй новое»)
1. Инвентаризация: найти текущие endpoints/сервисы (Get Requisite + Create Transaction) и записать результаты.
2. Новый endpoint «get requisite v2» (если старый нельзя менять):
   - `GET /.../requisite-v2` (точный путь выбираем после инвентаризации), отдельный action.
3. Новый endpoint/flow «create transaction v2» (если старый нельзя менять) или новый режим внутри нового action:
   - обновляет platform/bankAccount,
   - пишет историю,
   - всё в DB-транзакции.
4. (Если потребуется) миграция/расширение `neo_bank_withdrawals` под ссылки на shift/transaction.
5. Проверка: `yarn build` + ручной прогон через swagger.

---

## Приложение: что уже сделано
- Отдельный расчёт секций рабочего депозита без нео-банков:
  - Endpoint: `GET /working-deposit/sections-ledger-v2`
  - Логика unpaidPesos: текущий `SUM(bank_accounts.withdrawn_amount)` по `status=working`.
  - Файл плана по этой части: WORKING_DEPOSIT_V2_PLAN.md

---

## Найдено в коде (инвентаризация)

### GetRequisiteModal (фронт вызывает несколько endpoints)
1. Текущая смена:
  - Backend: `GET /shifts/my-current`
2. Получить реквизит (физ. банк):
  - Backend: `GET /bank-accounts/available`
  - Логика: выбирает `bank_accounts` со статусом `working`, `currentLimitAmount > 0`, сортировка по `priority`, затем `lastUsedAt`.
3. Список нео-банков для платформы смены:
  - Backend: `GET /drop-neo-banks` (get-all) с query `platformId` и `status=active`
  - Сейчас в ответе присутствуют лимиты (`dailyLimit`, `monthlyLimit`) и `alias`.

### Create Transaction (текущий endpoint)
- Backend: `POST /transactions`
- Реализация: `backend/src/features/transactions/create/create.service.ts`
- Сейчас делает в одной DB-транзакции:
  - проверяет активную смену оператора и платформу;
  - проверяет source neo-bank активен и что у него хватает `currentBalance` (ARS);
  - проверяет `platform.balance` хватает (USDT) по курсу neo-bank (или platform) и списывает;
  - создаёт `transactions` (COMPLETED) + пишет `amountUSDT`/`exchangeRate`;
  - увеличивает `bank_accounts.withdrawn_amount` и уменьшает `bank_accounts.current_limit_amount` (и может auto-block);
  - уменьшает `drop_neo_banks.current_balance` и корректирует `usdtEquivalent`/`exchangeRate`;
  - создаёт запись `neo_bank_withdrawals` с `balance_before/balance_after` и ссылкой на transaction.

### Замечание для нового флоу (v2)
- По новым правилам источник денег — платформа (по смене), а не баланс нео-банка.
- Поэтому текущий `POST /transactions` не меняем, а добавляем новый v2 endpoint с новой логикой.

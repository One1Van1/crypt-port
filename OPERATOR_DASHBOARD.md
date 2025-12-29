# Рабочая панель оператора

## Описание

Специальная страница для операторов, которая показывает:
- **Банки** с приоритетами и их счетами
- **Дропы** с информацией о счетах и банках
- **История транзакций** для каждого банка и дропа (только транзакции оператора)

## Backend Endpoints

### Банки оператора

#### GET `/banks/operator/my-banks`
Получить список всех банков с их счетами, отсортированными по приоритету.

**Response:**
```json
{
  "banks": [
    {
      "id": 1,
      "name": "Banco Galicia",
      "code": "GALICIA",
      "status": "active",
      "accounts": [
        {
          "id": 1,
          "cbu": "0170012345678901234567",
          "alias": "GALICIA.MAIN",
          "status": "working",
          "priority": 1,
          "limitAmount": 500000,
          "withdrawnAmount": 150000,
          "lastUsedAt": "2025-12-29T12:00:00Z",
          "dropName": "Drop 1"
        }
      ]
    }
  ]
}
```

### Транзакции банка для оператора

#### GET `/banks/:bankId/transactions/operator?page=1&limit=5`
Получить историю транзакций банка для текущего оператора.

**Query Parameters:**
- `page` (optional) - номер страницы (default: 1)
- `limit` (optional) - количество записей (default: 5, max: 100)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "amount": 50000,
      "amountUSDT": 50.5,
      "status": "completed",
      "comment": "Transaction comment",
      "bankAccountCbu": "0170012345678901234567",
      "bankAccountAlias": "GALICIA.MAIN",
      "dropName": "Drop 1",
      "createdAt": "2025-12-29T12:00:00Z",
      "updatedAt": "2025-12-29T12:05:00Z"
    }
  ],
  "total": 42
}
```

### Дропы оператора

#### GET `/drops/operator/my-drops`
Получить список всех дропов с информацией о счетах и банках.

**Response:**
```json
{
  "drops": [
    {
      "id": 1,
      "name": "Drop 1",
      "comment": "Main drop",
      "status": "active",
      "accountsCount": 5,
      "banks": [
        {
          "id": 1,
          "name": "Banco Galicia",
          "code": "GALICIA"
        }
      ]
    }
  ]
}
```

### Транзакции дропа для оператора

#### GET `/drops/:dropId/transactions/operator?page=1&limit=5`
Получить историю транзакций дропа для текущего оператора.

**Query Parameters:**
- `page` (optional) - номер страницы (default: 1)
- `limit` (optional) - количество записей (default: 5, max: 100)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "amount": 50000,
      "amountUSDT": 50.5,
      "status": "completed",
      "comment": "Transaction comment",
      "bankAccountCbu": "0170012345678901234567",
      "bankAccountAlias": "GALICIA.MAIN",
      "bankName": "Banco Galicia",
      "createdAt": "2025-12-29T12:00:00Z",
      "updatedAt": "2025-12-29T12:05:00Z"
    }
  ],
  "total": 42
}
```

## Frontend

### Доступ
- URL: `/operator-dashboard`
- Доступно только для роли: `operator`
- Пункт меню: "Рабочая панель"

### Функциональность

#### Секция "Банки"
- Карточки банков отсортированы по приоритету счетов
- Показывает первые 3 счета каждого банка
- При клике на банк:
  - Загружается история транзакций (последние 5)
  - Показывается информация о каждой транзакции
  - Кнопка "Показать всю историю" для загрузки до 100 транзакций

#### Секция "Дропы"
- Карточки дропов с информацией:
  - Название и комментарий
  - Количество активных счетов
  - Список банков, используемых в дропе
- При клике на дроп:
  - Загружается история транзакций (последние 5)
  - Показывается информация о каждой транзакции
  - Кнопка "Показать всю историю" для загрузки до 100 транзакций

### UI/UX особенности
- Цветовые индикаторы статусов (active, working, idle, blocked и т.д.)
- Форматирование валюты (ARS)
- Форматирование дат (локализация)
- Адаптивный дизайн (responsive)
- Загрузочные состояния (loading states)
- Выделение выбранной карточки

## Структура файлов

### Backend
```
backend/src/features/
├── banks/
│   ├── get-operator-banks/
│   │   ├── get-operator-banks.controller.ts
│   │   ├── get-operator-banks.service.ts
│   │   ├── get-operator-banks.response.dto.ts
│   │   └── openapi.decorator.ts
│   └── get-bank-transactions-for-operator/
│       ├── get-bank-transactions-for-operator.controller.ts
│       ├── get-bank-transactions-for-operator.service.ts
│       ├── get-bank-transactions-for-operator.query.dto.ts
│       ├── get-bank-transactions-for-operator.response.dto.ts
│       └── openapi.decorator.ts
└── drops/
    ├── get-operator-drops/
    │   ├── get-operator-drops.controller.ts
    │   ├── get-operator-drops.service.ts
    │   ├── get-operator-drops.response.dto.ts
    │   └── openapi.decorator.ts
    └── get-drop-transactions-for-operator/
        ├── get-drop-transactions-for-operator.controller.ts
        ├── get-drop-transactions-for-operator.service.ts
        ├── get-drop-transactions-for-operator.query.dto.ts
        ├── get-drop-transactions-for-operator.response.dto.ts
        └── openapi.decorator.ts
```

### Frontend
```
frontend/src/
├── pages/
│   └── OperatorDashboard/
│       ├── OperatorDashboard.tsx
│       └── OperatorDashboard.css
└── services/
    └── operator.service.ts
```

## Архитектурные принципы

Следуя принципам проекта:
- ✅ **Isolation** - каждый endpoint в своей папке
- ✅ **Atomicity** - 1 endpoint = 1 action = 1 controller
- ✅ **Immutability** - не изменялись существующие entities
- ✅ **Consistency** - переиспользуются существующие entities без изменений

# Инструкции для GitHub Copilot

## Базовые сущности (Entities)

### BaseEntity
Все сущности должны наследоваться от `BaseEntity` (`backend/src/common/utils/base.entity.ts`).

**НЕ НУЖНО** добавлять в каждую сущность поля:
- `id` - UUID primary key
- `createdAt` - дата создания
- `updatedAt` - дата обновления
- `deletedAt` - дата удаления (soft delete)

Эти поля уже есть в `BaseEntity`!

### Пример правильного создания сущности:

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

### ❌ НЕПРАВИЛЬНО:
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // ❌ Не нужно! Уже есть в BaseEntity

  @CreateDateColumn()
  createdAt: Date;  // ❌ Не нужно! Уже есть в BaseEntity

  @Column()
  name: string;
}
```

### ✅ ПРАВИЛЬНО:
```typescript
@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;
  
  @Column({ unique: true })
  email: string;
}
```

## Структура проекта

### Backend (NestJS)
- `src/common/` - общие модули, entities, decorators, guards
- `src/modules/` - бизнес-модули (users, auth, products и т.д.)
- Каждый модуль должен иметь структуру:
  - `*.module.ts`
  - `*.controller.ts`
  - `*.service.ts`
  - `entities/*.entity.ts`
  - `dto/*.dto.ts`

### Frontend (React + TypeScript)
- `src/components/` - переиспользуемые компоненты
- `src/pages/` - страницы приложения
- `src/services/` - API сервисы
- `src/types/` - TypeScript типы и интерфейсы
- `src/hooks/` - кастомные React hooks

## Соглашения о коде

### TypeScript
- Всегда используй строгую типизацию
- Избегай `any`, используй `unknown` если нужно
- Используй интерфейсы для объектов, type для union/intersection

### Naming
- Компоненты React: `PascalCase`
- Файлы компонентов: `PascalCase.tsx`
- Функции и переменные: `camelCase`
- Константы: `UPPER_SNAKE_CASE`
- Entities: `PascalCase` + extends `BaseEntity`

### API Endpoints
- GET `/api/resource` - получить список
- GET `/api/resource/:id` - получить один
- POST `/api/resource` - создать
- PATCH `/api/resource/:id` - обновить
- DELETE `/api/resource/:id` - удалить (soft delete)

## Git
- Коммиты на английском
- Формат: `type: description`
  - `feat:` - новая функциональность
  - `fix:` - исправление бага
  - `refactor:` - рефакторинг
  - `docs:` - документация
  - `style:` - форматирование
  - `test:` - тесты

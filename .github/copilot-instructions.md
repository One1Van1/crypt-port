# Инструкции для GitHub Copilot

## 🎯 Архитектурные принципы

### Главное правило: "Никогда не трогай старое, только добавляй новое"

- **Immutability** - НИКОГДА не редактируй существующий код, entities, endpoints
- **Atomicity** - 1 эндпойнт = 1 изолированная папка = 1 action
- **Isolation** - Каждая feature полностью самодостаточна
- **Consistency** - Переиспользуй существующие stable entities без изменений

---

## 📦 Структура API Endpoints

### Каждый endpoint - это изолированная папка в `src/features/{module}/{action}/`

```
src/
  features/           # все изолированные API actions
    users/
      get-all/
        get-all.controller.ts
        get-all.service.ts
        get-all.query.dto.ts
        get-all.response.dto.ts
        openapi.decorator.ts
      get-by-id/
        get-by-id.controller.ts
        get-by-id.service.ts
        get-by-id.response.dto.ts
        openapi.decorator.ts
      create/
        create.controller.ts
        create.service.ts
        create.request.dto.ts
        create.response.dto.ts
        openapi.decorator.ts
  modules/            # модули, импортирующие controllers из features
    users.module.ts
  entities/           # стабильные, неизменяемые entities
    user.entity.ts
  common/             # общие utils, decorators, guards
```

---

## 🧩 Структура одного Action (Endpoint)

### ✅ Обязательные файлы для каждого action:

```
get-all/
  ├── get-all.controller.ts      # 1 controller = 1 endpoint = 1 метод
  ├── get-all.service.ts          # 1 service = 1 метод execute()
  ├── get-all.query.dto.ts        # DTOs для query параметров (если нужно)
  ├── get-all.response.dto.ts     # DTO для response
  └── openapi.decorator.ts        # Swagger документация
```

---

## 📝 Правила создания файлов

### 1️⃣ Controller (`*.controller.ts`)

**Требования:**
- Ровно ОДИН controller на action
- Ровно ОДИН метод на controller
- Метод всегда называется `handle()`
- @ApiTags с именем фичи
- Явная типизация return type и параметров

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllUsersService } from './get-all.service';
import { GetAllUsersQueryDto } from './get-all.query.dto';
import { GetAllUsersResponseDto } from './get-all.response.dto';
import { ApiGetAllUsers } from './openapi.decorator';

@Controller('users')
@ApiTags('GetAllUsers')
export class GetAllUsersController {
  constructor(private readonly service: GetAllUsersService) {}

  @Get()
  @ApiGetAllUsers()
  async handle(@Query() query: GetAllUsersQueryDto): Promise<GetAllUsersResponseDto> {
    return this.service.execute(query);
  }
}
```

**Паттерны типизации:**

```typescript
// GET с query параметрами
async handle(@Query() query: QueryDto): Promise<ResponseDto>

// GET с path параметрами
async handle(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto>

// GET с обоими
async handle(
  @Param('userId', ParseIntPipe) userId: number,
  @Query() query: QueryDto
): Promise<ResponseDto>

// POST
async handle(@Body() dto: CreateDto): Promise<ResponseDto>

// POST с auth
async handle(
  @Body() dto: CreateDto,
  @CurrentUser() user: User
): Promise<ResponseDto>

// PATCH
async handle(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateDto
): Promise<ResponseDto>

// DELETE
async handle(@Param('id', ParseIntPipe) id: number): Promise<void>
```

**❌ ЗАПРЕЩЕНО:**
- Несколько методов в одном controller
- Переиспользовать controller для разных endpoints
- Изменять существующие controllers
- Забывать @ApiTags
- Использовать `any` в типах

**✅ ОБЯЗАТЕЛЬНО:**
- ParseIntPipe для ID параметров
- Явный return type
- @ApiTags декоратор

---

### 2️⃣ Service (`*.service.ts`)

**Требования:**
- Один service на action
- Один публичный метод: `execute()`
- Вся бизнес-логика здесь

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { GetAllUsersQueryDto } from './get-all.query.dto';
import { GetAllUsersResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetAllUsersQueryDto): Promise<GetAllUsersResponseDto> {
    const [items, total] = await this.userRepository.findAndCount({
      take: query.limit || 10,
      skip: ((query.page || 1) - 1) * (query.limit || 10),
    });

    return new GetAllUsersResponseDto(items, total);
  }
}
```

**❌ ЗАПРЕЩЕНО:**
- Импортировать services из других actions
- Несколько публичных методов

**✅ ОБЯЗАТЕЛЬНО:**
- Единственный публичный метод `execute()`
- Внедрение зависимостей через constructor

---

### 3️⃣ DTOs (`*.dto.ts`)

**Требования:**
- Уникальные DTOs для каждого action
- Явные, описательные имена (привязаны к action)
- Валидация с class-validator
- Swagger документация с @ApiProperty

```typescript
import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAllUsersQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Search by name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetAllUsersResponseDto {
  @ApiProperty({ description: 'List of users' })
  items: User[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: User[], total: number) {
    this.items = items;
    this.total = total;
  }
}
```

**Работа с Enums:**

```typescript
import { UserRole } from '../../../common/enums/user.enum';

export class CreateUserDto {
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.USER,
    description: 'User role',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
```

**❌ ЗАПРЕЩЕНО:**
- Импортировать DTOs из других actions
- Использовать generic имена (CreateDto, GetDto)
- Забывать @ApiProperty
- Использовать массивы строк вместо enums

**✅ ОБЯЗАТЕЛЬНО:**
- Уникальное имя DTO для каждого action
- @ApiProperty для всех полей
- enumName для enum полей
- Валидация с class-validator

---

### 4️⃣ OpenAPI Decorator (`openapi.decorator.ts`)

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetAllUsersResponseDto } from './get-all.response.dto';

export const ApiGetAllUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all users with pagination' }),
    ApiOkResponse({ type: GetAllUsersResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
  );
```

**❌ ЗАПРЕЩЕНО:**
- Добавлять @ApiTags (это в controller)

**✅ ОБЯЗАТЕЛЬНО:**
- Понятное summary
- Правильный response type

---

## 🚫 Критические ограничения

| Правило | Объяснение |
|---------|------------|
| **Immutable Entities** | НИКОГДА не добавляй поля в существующие entities |
| **Isolated Actions** | НИКОГДА не импортируй services/DTOs из других actions |
| **Atomicity** | 1 action = 1 endpoint = 1 папка |
| **No Refactoring** | НИКОГДА не изменяй существующие файлы |
| **DTO Isolation** | У каждого action свои уникальные DTOs |

---

## 📋 Workflow добавления нового endpoint

1. Определи точный endpoint (GET, POST, PATCH, DELETE)
2. Создай папку `src/features/{module}/{action}/`
3. Создай файлы: controller, service, DTOs, openapi.decorator
4. Добавь controller в соответствующий модуль (`*.module.ts`)
5. Проверь работу endpoint
6. Закоммить изменения

---

## ❌ Типичные ошибки

- ❌ Импортировать DTOs/services из других actions
- ❌ Изменять существующие entities
- ❌ Несколько endpoints в одном controller
- ❌ Shared DTOs между actions
- ❌ Создавать index.ts файлы
- ❌ Использовать нетипизированные параметры
- ❌ Забывать ParseIntPipe
- ❌ Массивы строк вместо enums

---

## ✅ Checklist перед коммитом

- ☑️ Action в своей изолированной папке
- ☑️ Controller с @ApiTags и одним методом handle()
- ☑️ Явный return type в controller
- ☑️ Все параметры типизированы
- ☑️ ParseIntPipe для ID параметров
- ☑️ Service с методом execute()
- ☑️ Уникальные DTOs
- ☑️ OpenAPI decorator
- ☑️ Нет импортов из других actions
- ☑️ Entities не изменены

---

## 🎨 Naming Conventions

### TypeScript
- Компоненты React: `PascalCase`
- Файлы компонентов: `PascalCase.tsx`
- Функции и переменные: `camelCase`
- Константы: `UPPER_SNAKE_CASE`
- Entities: `PascalCase` + extends `BaseEntity`
- Controllers: `{Action}{Module}Controller` (GetAllUsersController)
- Services: `{Action}{Module}Service` (GetAllUsersService)
- DTOs: `{Action}{Module}{Type}Dto` (GetAllUsersQueryDto)

### API Endpoints
- GET `/api/resource` - получить список
- GET `/api/resource/:id` - получить один
- POST `/api/resource` - создать
- PATCH `/api/resource/:id` - обновить
- DELETE `/api/resource/:id` - удалить (soft delete)

---

## 📚 Git Conventions

### Формат коммитов
```
type: description
```

### Типы коммитов:
- `feat:` - новая функциональность
- `fix:` - исправление бага
- `refactor:` - рефакторинг
- `docs:` - документация
- `style:` - форматирование
- `test:` - тесты
- `chore:` - технические задачи

### Примеры:
```bash
feat: Add get-all-users endpoint
fix: Resolve UUID validation in user controller
refactor: Move BaseEntity to common/utils
docs: Update API documentation for users module
```

---

## 🚀 Быстрый старт

### Команда "Поехали"
Для запуска проекта используй команду:
- **Cmd+Shift+P** → `Tasks: Run Task` → **"Поехали"**
- Или скажи копилоту: **"Поехали"** или **"Запусти проект"**

Это запустит одновременно backend (port 3000) и frontend (port 5173).

---

## 📖 Структура проекта

### Backend (NestJS)
- `src/features/` - изолированные API actions
- `src/modules/` - модули, импортирующие controllers
- `src/entities/` - стабильные entities
- `src/common/` - общие utils, decorators, guards

### Frontend (React + TypeScript)
- `src/components/` - переиспользуемые компоненты
- `src/pages/` - страницы приложения
- `src/services/` - API сервисы
- `src/types/` - TypeScript типы и интерфейсы
- `src/hooks/` - кастомные React hooks

---

## 🎯 Главное правило

> **Always EXTEND. Never MODIFY. Always ISOLATE.**
> 
> Всегда расширяй. Никогда не изменяй. Всегда изолируй.

---

## 🎯 Базовые сущности (Entities)

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

---

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

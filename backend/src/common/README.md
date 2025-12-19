# Common Module

Этот модуль содержит общие компоненты, которые используются во всем приложении.

## BaseEntity

Базовая сущность, от которой должны наследоваться все Entity в приложении.

### Поля

- `id: string` - UUID primary key (генерируется автоматически)
- `createdAt: Date` - Дата и время создания записи
- `updatedAt: Date` - Дата и время последнего обновления
- `deletedAt: Date | null` - Дата и время мягкого удаления (для soft delete)

### Использование

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

**Важно:** Не добавляйте поля `id`, `createdAt`, `updatedAt`, `deletedAt` в дочерние сущности - они уже есть в BaseEntity!

### Soft Delete

Все сущности, наследующие BaseEntity, автоматически поддерживают "мягкое удаление" (soft delete).
Это означает, что при удалении записи она не удаляется из БД, а помечается полем `deletedAt`.

Для использования soft delete в репозиториях используйте методы:
- `softDelete(id)` - мягкое удаление
- `restore(id)` - восстановление удаленной записи
- `softRemove(entity)` - мягкое удаление через entity

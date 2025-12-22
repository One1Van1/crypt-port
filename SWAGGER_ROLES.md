# Swagger Roles Documentation

## 🎨 Легенда ролей в Swagger:

- 🔴 **[ADMIN]** - Только администратор
- 🟡 **[ADMIN, TEAMLEAD]** - Админ или тимлид
- 🟢 **[OPERATOR]** - Только оператор
- ⚪ **[ANY]** - Любой авторизованный пользователь
- 🔓 **[PUBLIC]** - Без авторизации

## Примеры в Swagger UI:

### Banks Module:
- 🔴 [ADMIN] Create a new bank
- 🔴 [ADMIN] Update bank information
- 🔴 [ADMIN] Update bank status
- ⚪ [ANY] Get all banks with optional filters
- ⚪ [ANY] Get bank by ID

### Drops Module:
- 🟡 [ADMIN, TEAMLEAD] Create a new drop
- 🟡 [ADMIN, TEAMLEAD] Update drop information
- 🟡 [ADMIN, TEAMLEAD] Update drop status
- ⚪ [ANY] Get all drops
- ⚪ [ANY] Get drop by ID

### Shifts Module:
- 🟢 [OPERATOR] Start a new shift
- 🟢 [OPERATOR] End current shift
- 🟢 [OPERATOR] Get my current shift
- 🟡 [ADMIN, TEAMLEAD] Get all shifts
- 🟡 [ADMIN, TEAMLEAD] Get shift by ID

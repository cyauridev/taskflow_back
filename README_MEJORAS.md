# Backend mejorado

## Qué se agregó

### 1. CRUD completo de usuarios
Endpoints en `/users`:
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /users/me`
- `PATCH /users/me`

Mejoras:
- validación de email único
- hash automático de contraseña al crear/editar
- borrado lógico con `estado = false`
- exclusión del password en respuestas serializadas

### 2. Estados de tareas en base de datos
Se agregó la tabla `task_statuses` con su CRUD en `/task-statuses`.

Campos:
- `code`
- `nombre`
- `orden`
- `color`
- `isFinal`

Estados iniciales del seed:
- `todo` = Por iniciar
- `in_progress` = En proceso
- `in_review` = En revisión
- `done` = Culminado

### 3. Tareas conectadas a estados dinámicos
La tabla `tasks` ahora tiene:
- `status` (código del estado, útil para frontend)
- `status_id` (FK a `task_statuses`)

Ya puedes mover por drag and drop enviando cualquiera de estos payloads:

```json
PATCH /tasks/:id/status
{ "status": "in_progress" }
```

o

```json
PATCH /tasks/:id/status
{ "statusId": "uuid-del-estado" }
```

### 4. Eliminación de tareas
Ya existe:
- `DELETE /tasks/:id`

Para tu equis del frontend puedes conectarla directo a ese endpoint.

### 5. Modificación de tareas
Ya existe:
- `PATCH /tasks/:id`

Eso te sirve para abrir un modal desde el frontend y editar:
- título
- descripción
- asignado
- prioridad
- fecha
- estado

## Cambios importantes para frontend

Cuando cargues columnas del Kanban, lo ideal ahora es:

1. consultar `GET /task-statuses`
2. pintar los carriles por `orden`
3. consultar `GET /tasks`
4. agrupar por `task.status` o `task.statusId`

Así ya no tendrás columnas en duro.

## Si ya tienes la BD creada
Debes recrear migración o ajustar tu esquema con:
- nueva tabla `task_statuses`
- nueva columna `tasks.status_id`
- FK a `task_statuses(id)`

## Seed de ejemplo
Usuarios iniciales:
- `admin@taskflow.com / Admin123!`
- `maria@taskflow.com / Maria123!`
- `carlos@taskflow.com / Carlos123!`

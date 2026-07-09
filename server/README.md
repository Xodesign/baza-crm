# CRM Backend API

REST API сервер для CRM системы "База".

## Технологии

- Node.js 20+
- Express.js
- PostgreSQL 15

## Установка и запуск

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте подключение к базе данных:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db
```

### 3. Docker Compose (рекомендуется)

```bash
docker-compose up -d
```

Это запустит PostgreSQL и API сервер.

### 4. Ручная установка

Сначала создайте базу данных PostgreSQL:

```sql
CREATE DATABASE crm_db;
CREATE USER crm_user WITH ENCRYPTED PASSWORD 'crm_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
```

Затем инициализируйте схему:

```bash
npm run db:init
```

И запустите сервер:

```bash
npm start        # Production
npm run dev      # Development (с hot reload)
```

## API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /api/health` | Проверка работоспособности |
| `GET /api/objects` | Список объектов |
| `GET /api/calls` | Список вызовов/заявок |
| `GET /api/staff` | Список персонала |
| `GET /api/costs` | Список затрат |
| `GET /api/systems` | Список систем |
| `GET /api/tools` | Список инструментов |
| `GET /api/transport` | Заявки на транспорт |
| `GET /api/buy` | Заявки на закупку |
| `GET /api/invoices` | Счета |
| `GET /api/contacts` | Контакты |
| `GET /api/activations` | Актирование |
| `GET /api/time` | Учёт времени |
| `GET /api/wishes` | Пожелания |

Каждый endpoint поддерживает CRUD операции:
- `GET /{resource}` - получить все
- `GET /{resource}/{id}` - получить один
- `POST /{resource}` - создать
- `PUT /{resource}/{id}` - обновить
- `DELETE /{resource}/{id}` - удалить

## Структура проекта

```
server/
├── src/
│   ├── db/
│   │   ├── db.js      # Подключение к БД
│   │   ├── init.js    # Инициализация схемы
│   │   └── seed.js    # Начальные данные
│   ├── routes/        # API routes
│   └── index.js       # Главный файл сервера
├── .env.example
├── docker-compose.yml
└── Dockerfile
```

## Интеграция с Frontend

В frontend добавьте переменную окружения:

```env
VITE_API_URL=http://localhost:3001/api
```

Или используйте встроенный Vite proxy, настроив `vite.config.js`:

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

## Лицензия

MIT

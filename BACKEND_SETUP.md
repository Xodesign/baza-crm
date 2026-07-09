# CRM Backend Setup Guide

## Структура проекта

```
baza/
├── server/                 # Backend API
│   ├── src/
│   │   ├── index.js       # Express сервер
│   │   ├── db/            # Подключение к БД
│   │   └── routes/        # API routes (14 сущностей)
│   ├── docker-compose.yml  # PostgreSQL + API
│   ├── Dockerfile
│   └── package.json
├── src/
│   ├── api/index.js       # Frontend API клиент
│   └── App.jsx            # CRM Frontend
└── vite.config.js          # Vite с API proxy
```

## Быстрый старт (Docker)

```bash
cd /home/user/baza/server
docker-compose up -d
```

## Быстрый старт (без Docker)

### 1. Установите PostgreSQL локально

### 2. Создайте базу данных

```sql
CREATE DATABASE crm_db;
CREATE USER crm_user WITH ENCRYPTED PASSWORD 'crm_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
```

### 3. Настройте .env

```bash
cd /home/user/baza/server
cp .env.example .env
# Отредактируйте DATABASE_URL
```

### 4. Запустите сервер

```bash
npm install
npm run db:init   # Создать таблицы
npm run db:seed   # Добавить тестовые данные
npm start         # Запуск на порту 3001
```

## Frontend

Frontend уже настроен для работы с API через Vite proxy.

```bash
cd /home/user/baza
npm run dev
```

Откройте http://localhost:5173

## API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /api/objects` | Объекты |
| `GET /api/calls` | Вызовы/Заявки |
| `GET /api/staff` | Персонал |
| `GET /api/costs` | Затраты |
| `GET /api/systems` | Системы |
| `GET /api/tools` | Инструменты |
| `GET /api/transport` | Транспорт |
| `GET /api/buy` | Закупки |
| `GET /api/invoices` | Счета |
| `GET /api/contacts` | Контакты |
| `GET /api/activations` | Актирование |
| `GET /api/time` | Учёт времени |
| `GET /api/wishes` | Пожелания |

Каждый endpoint поддерживает: `GET`, `POST`, `PUT`, `DELETE`

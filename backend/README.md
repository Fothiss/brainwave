# Backend

Этот проект использует **PostgreSQL** для хранения данных.  
Ниже приведён пример конфигурации переменных окружения и краткие инструкции по запуску.

## ⚙️ Переменные окружения

Создайте файл `.env` в корне проекта и добавьте следующие параметры:

```env
# PostgreSQL
DB_NAME=chat
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5433

# Qdrant
QDRANT_HTTP_PORT=6333
QDRANT_GRPC_PORT=6334
QDRANT_HOST=qdrant

CLIENT_ID=00000000-0000-0000-0000-000000000000
CLIENT_SECRET=00000000-0000-0000-0000-000000000000
AUTH_KEY=0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

CONFLUENCE_URL=""
CONFLUENCE_USERNAME=""
CONFLUENCE_API_TOKEN=""
CONFLUENCE_SPACE_KEY=""
```

## Особенности

В utils необходимо поместить файл `service_account.json` для google drive, взятый из google drive console
# Order Management API

> API RESTful para gerenciamento de pedidos e produtos com arquitetura hexagonal, DDD, e foco em escalabilidade e segurança.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Funcionalidades](#funcionalidades)
- [Comandos Úteis](#comandos-úteis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Banco](#estrutura-do-banco)
- [Testando a API](#testando-a-api)
- [Troubleshooting](#troubleshooting)
- [Documentação Adicional](#documentação-adicional)

---

## Sobre o Projeto

Sistema completo de gerenciamento de pedidos e produtos desenvolvido como teste técnico, demonstrando:

✨ **Principais Features:**

- 🔐 Autenticação JWT com refresh tokens
- 🛒 Controle transacional de estoque (proteção contra race conditions)
- ⏰ Expiração automática de pedidos pendentes (30 minutos)
- 🛡️ Rate limiting e idempotência
- 📊 Logs estruturados com Winston
- 📚 Documentação Swagger/OpenAPI
- 🐳 Ambiente Docker completo

**Diferenciais Técnicos:**

- Clean Architecture (Hexagonal Architecture)
- Domain-Driven Design (DDD)
- SOLID Principles
- Repository Pattern
- Value Objects
- Use Cases isolados

Para detalhes sobre arquitetura e decisões de design, veja [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Tecnologias

### Core Stack

- **Node.js 22** - Runtime JavaScript
- **TypeScript 5.x** - Tipagem estática
- **NestJS 11** + **Fastify** - Framework backend (2x mais rápido que Express)

### Database & Cache

- **PostgreSQL 16** - Banco relacional
- **Prisma 7** - ORM type-safe
- **Redis 7** - Cache e sessões

### Security & Auth

- **JWT** - Autenticação stateless
- **bcrypt** - Hash de senhas
- **@nestjs/throttler** - Rate limiting
- **class-validator** - Validação de entrada

### DevOps

- **Docker** + **Docker Compose** - Containerização
- **Winston** - Logging estruturado
- **Swagger** - Documentação automática

---

## Requisitos

- **Node.js** >= 22.0.0
- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **Yarn** >= 1.22.0

---

## Instalação e Execução

### Opção 1: Setup Automático (Recomendado) 🎉

O script `setup.sh` configura tudo automaticamente:

```bash
# Tornar executável (primeira vez)
chmod +x setup.sh

# Executar
./setup.sh
```

**O que o script faz:**

1. ✅ Verifica Docker
2. ✅ Cria `.env`
3. ✅ Builda imagens
4. ✅ Sobe PostgreSQL + Redis
5. ✅ Aguarda serviços prontos
6. ✅ Instala dependências
7. ✅ Gera Prisma Client
8. ✅ Roda migrations
9. ✅ Popula banco (seed)
10. ✅ Sobe aplicação

**Após o setup:**

- 🌐 API: http://localhost:3000
- 📖 Swagger: http://localhost:3000/api
- ❤️ Health: http://localhost:3000/health
- 👤 Login de teste: `admin@example.com` / `Admin@123`

---

### Opção 2: Docker Compose Manual

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Editar .env (configurar JWT_SECRET, etc)
nano .env

# 3. Subir tudo
docker compose up -d

# 4. Rodar migrations
docker compose exec app yarn prisma migrate deploy

# 5. Popular banco (opcional)
docker compose exec app yarn db:seed

# 6. Ver logs
docker compose logs -f app
```

**Comandos Docker:**

```bash
# Parar tudo
docker compose down

# Parar e limpar volumes
docker compose down -v

# Reiniciar apenas app
docker compose restart app

# Acessar shell
docker compose exec app sh

# Ver logs
docker compose logs -f app
```

---

### Opção 3: Execução Local (Desenvolvimento)

**Requer PostgreSQL e Redis rodando** (pode usar Docker só para eles):

```bash
# 1. Subir apenas bancos
docker compose up -d postgres redis

# 2. Configurar .env
cp .env.example .env
# Editar URLs: DATABASE_URL, REDIS_HOST=localhost

# 3. Instalar dependências
yarn install

# 4. Gerar Prisma Client
yarn prisma:generate

# 5. Rodar migrations
yarn prisma:migrate:dev

# 6. Popular banco (opcional)
yarn db:seed

# 7. Iniciar aplicação
yarn start:dev
```

## Endpoints da API

**Acesse:** http://localhost:3000

---

- **Swagger UI:** http://localhost:3000/api

### Resumo dos Endpoints

#### 🔐 Authentication

```
POST   /auth/login          # Login (retorna access + refresh token)
POST   /auth/refresh        # Renovar access token
POST   /auth/logout         # Invalidar refresh token
GET    /auth/me            # Dados do usuário autenticado (protegido)
```

#### 👥 Users

```
POST   /users              # Criar usuário
GET    /users              # Listar usuários (paginado)
GET    /users/:id          # Buscar usuário por ID
PATCH  /users/:id          # Atualizar usuário
DELETE /users/:id          # Deletar usuário (soft delete)
```

#### 📦 Products

```
POST   /products           # Criar produto
GET    /products           # Listar produtos (filtros + paginação)
GET    /products/:id       # Buscar produto por ID
PATCH  /products/:id       # Atualizar produto
DELETE /products/:id       # Deletar produto (soft delete)
```

#### 🛒 Orders (Protegidos - Requer JWT)

```
POST   /orders             # Criar pedido (reserva estoque)
GET    /orders             # Listar pedidos do usuário
GET    /orders/:id         # Buscar pedido por ID
PATCH  /orders/:id/complete # Completar pedido (debita estoque)
```

#### 🏥 Health

```
GET    /health             # Health check
```

---

## Autenticação

### 1. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

**Resposta:**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### 2. Usar Access Token

```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 3. Renovar Token (quando expirar)

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

## Funcionalidades

### 👥 Gerenciamento de Usuários

**Criar Usuário:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "Senha@123"
  }'
```

**Validações:**

- Senha: min 8 chars, maiúscula, minúscula, número, especial
- Nome: min 3 chars
- Email: único no sistema

**Listar com Paginação:**

```bash
curl "http://localhost:3000/users?page=1&limit=10"
```

---

### Gerenciamento de Produtos

**Criar Produto:**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "description": "Notebook Dell Inspiron 15",
    "price": 3500.00,
    "stock": 10,
    "category": "Electronics"
  }'
```

**Listar com Filtros:**

```bash
# Buscar notebooks entre R$2000 e R$5000, ordenado por preço
curl "http://localhost:3000/products?name=notebook&minPrice=2000&maxPrice=5000&sortBy=price&sortOrder=asc&page=1&limit=10"
```

**Filtros Disponíveis:**

- `name` - Busca parcial (case-insensitive)
- `category` - Categoria exata
- `minPrice`, `maxPrice` - Range de preço
- `minStock` - Estoque mínimo
- `sortBy` - name | price | createdAt
- `sortOrder` - asc | desc
- `page`, `limit` - Paginação

---

### Gerenciamento de Pedidos

**Criar Pedido (com Idempotência):**

```bash
TOKEN="seu_access_token"
IDEMPOTENCY_KEY=$(uuidgen)

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "items": [
      {
        "productId": "uuid-do-produto-1",
        "quantity": 2
      },
      {
        "productId": "uuid-do-produto-2",
        "quantity": 1
      }
    ]
  }'
```

**O que acontece:**

1.  Valida estoque disponível
2.  **Reserva estoque** (transação atômica)
3.  Cria pedido como PENDING
4.  Adiciona ao Redis (TTL 30min)
5.  Salva idempotency key

**Completar Pedido:**

```bash
curl -X PATCH http://localhost:3000/orders/ORDER_ID/complete \
  -H "Authorization: Bearer $TOKEN"
```

**Listar Pedidos do Usuário:**

```bash
curl "http://localhost:3000/orders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Expiração Automática de Pedidos

Pedidos PENDING que não são completados em **30 minutos** são **automaticamente cancelados** e o estoque é **devolvido**.

**Como funciona:**

1. Ao criar pedido → adiciona no Redis com TTL 30min
2. Scheduler roda a cada 10 segundos
3. Busca pedidos PENDING no banco
4. Compara com Redis
5. Se pedido não está mais no Redis → **expirou**
6. Cancela pedido e devolve estoque (transação)

**Ver logs:**

```bash
docker compose logs -f app | grep OrderExpirationScheduler
```

---

### 🛡️ Rate Limiting

Proteção contra abuso:

| Endpoint                   | Limite      |
| -------------------------- | ----------- |
| Global                     | 100 req/min |
| POST /auth/login           | 5 req/min   |
| POST /auth/refresh         | 10 req/min  |
| POST /users                | 10 req/min  |
| POST /orders               | 20 req/min  |
| PATCH /orders/:id/complete | 10 req/min  |

**Teste:**

```bash
# Fazer 6 requests rápidos (6º vai dar 429)
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@example.com", "password": "Admin@123"}'
done
```

---

### 🔁 Idempotência

Evita duplicatas em caso de retry:

**Endpoints com Idempotência:**

- POST /users
- POST /orders

**Como usar:**

```bash
# Mesma key = mesma requisição
KEY="123e4567-e89b-12d3-a456-426614174000"

# Request 1 - Cria recurso
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $KEY" \
  -d '{"items": [...]}'
# → 201 Created

# Request 2 - Mesma key (retry)
curl -v -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $KEY" \
  -d '{"items": [...]}'
# → 409 Conflict
# Header: X-Resource-Id: order_id_criado_antes
```

---

## Comandos Úteis

### Aplicação

```bash
# Desenvolvimento
yarn start:dev              # Hot-reload

# Produção
yarn build                  # Build
yarn start:prod             # Rodar build

# Testes (quando implementados)
yarn test                   # Rodar testes
yarn test:cov               # Com coverage
```

### Prisma

```bash
# Prisma Studio (GUI do banco)
yarn prisma studio
# Ou via Docker:
docker compose exec app yarn prisma studio

# Gerar Prisma Client
yarn prisma generate

# Criar nova migration
yarn prisma migrate:dev --name nome_da_migration

# Aplicar migrations (produção)
yarn prisma migrate deploy

# Reset banco (CUIDADO - apaga tudo)
yarn prisma migrate reset

# Seed
yarn db:seed
```

### Docker

```bash
# Ver todos os containers
docker compose ps

# Logs de um serviço específico
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f app

# Executar comando no container
docker compose exec app sh
docker compose exec postgres psql -U postgres

# Limpar tudo (volumes incluídos)
docker compose down -v

# Rebuild sem cache
docker compose build --no-cache app
```

### Redis

```bash
# Acessar Redis CLI
docker compose exec redis redis-cli -a redis123

# Ver todas as keys
KEYS *

# Ver pedidos pendentes
KEYS pending_order:*

# Ver idempotency keys
KEYS idempotency:*

# Ver refresh tokens
KEYS refresh_token:*

# Limpar tudo (CUIDADO)
FLUSHALL
```

### PostgreSQL

```bash
# Acessar PostgreSQL
docker compose exec postgres psql -U postgres -d order_management

# Ver tabelas
\dt

# Ver usuários
SELECT id, name, email, created_at FROM users;

# Ver pedidos
SELECT id, user_id, status, total, created_at FROM orders;

# Ver produtos
SELECT id, name, price, stock, category FROM products;

# Sair
\q
```

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/order_management"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=order_management
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

---

## Documentação Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura detalhada, decisões de design, SOLID, patterns
- **Swagger UI:** http://localhost:3000/api - Documentação interativa da API
- **Prisma Studio:** `yarn prisma studio` - GUI do banco de dados

---

## Estrutura do Banco

### Tabelas Principais

**users**

- id (UUID, PK)
- name
- email (unique)
- password (hashed)
- created_at, updated_at, deleted_at

**products**

- id (UUID, PK)
- name
- description
- price (Decimal)
- stock (Integer)
- category
- created_at, updated_at, deleted_at

**orders**

- id (UUID, PK)
- user_id (FK → users)
- total (Decimal)
- status (PENDING, COMPLETED, CANCELLED)
- created_at, updated_at

**order_items**

- id (UUID, PK)
- order_id (FK → orders)
- product_id (FK → products)
- quantity
- price (preço no momento da compra)

**refresh_tokens**

- id (UUID, PK)
- token (UUID, unique)
- user_id (FK → users)
- expires_at
- created_at

---

## Testando a API

### Fluxo Completo

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
# Copiar accessToken

# 3. Criar produto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Product for testing",
    "price": 100.00,
    "stock": 5,
    "category": "Test"
  }'
# Copiar productId

# 4. Criar pedido
TOKEN="seu_access_token"
PRODUCT_ID="uuid_do_produto"

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 2
      }
    ]
  }"
# Copiar orderId

# 5. Completar pedido
ORDER_ID="uuid_do_pedido"

curl -X PATCH http://localhost:3000/orders/$ORDER_ID/complete \
  -H "Authorization: Bearer $TOKEN"

# 6. Verificar estoque foi debitado
curl http://localhost:3000/products/$PRODUCT_ID
# stock deve ter diminuído de 5 para 3
```

---

## Troubleshooting

### Porta já em uso

```bash
# Ver o que está usando a porta 3000
lsof -i :3000

# Matar processo
kill -9 PID
```

### Erro de permissão no setup.sh

```bash
chmod +x setup.sh
```

### Docker Compose não encontrado

```bash
# Instalar Docker Compose plugin
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Prisma Client não gerado

```bash
docker compose exec app yarn prisma generate
# Ou localmente:
yarn prisma generate
```

### Migrations não aplicadas

```bash
docker compose exec app yarn prisma migrate deploy
```

### Redis/PostgreSQL não sobe

```bash
# Ver logs
docker compose logs postgres
docker compose logs redis

# Verificar portas
docker compose ps
```

### Hot-reload não funciona

Certifique-se que `/app/dist` NÃO está nos volumes do docker-compose.yml:

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

---

## Licença

Este projeto foi desenvolvido como teste técnico.

---

## Autor

**Héverton Vinícius** - Sênior Software Engineer

---

## Agradecimentos

Projeto desenvolvido para demonstrar conhecimentos em:

- Clean Architecture
- Domain-Driven Design
- SOLID Principles
- NestJS + TypeScript
- Docker
- PostgreSQL + Prisma
- Redis
- JWT Authentication
- Rate Limiting
- Idempotency
- Logging & Observability

---

**📖 Para detalhes sobre arquitetura, decisões de design e trade-offs, consulte [ARCHITECTURE.md](./ARCHITECTURE.md)**

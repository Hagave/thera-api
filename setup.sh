#!/bin/bash

# Order Management API - Complete Setup Script
# Configura e sobe todo o ambiente do zero

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Order Management API - Complete Setup              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detectar e criar função para Docker Compose
echo -e "${YELLOW}🔍 Detecting Docker Compose command...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Using: docker-compose${NC}\n"
    docker_compose() { docker-compose "$@"; }
elif docker compose version &> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Using: docker compose${NC}\n"
    docker_compose() { docker compose "$@"; }
else
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

# 1. Verificar se Docker está rodando
echo -e "${YELLOW}🔍 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}\n"

# 2. Criar .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please review .env and update secrets before production!${NC}\n"
else
    echo -e "${GREEN}✅ .env file already exists${NC}\n"
fi

# Validar se JWT secrets foram configurados
if grep -q "your-super-secret" .env; then
    echo -e "${RED}⚠️  WARNING: You are using default JWT secrets!${NC}"
    echo -e "${YELLOW}For production, please update JWT_SECRET and JWT_REFRESH_SECRET in .env${NC}\n"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelled. Please update .env and run again.${NC}"
        exit 1
    fi
fi

# 3. Limpar containers antigos (opcional)
read -p "🧹 Remove old containers and volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning up old containers and volumes...${NC}"
    docker_compose down -v
    echo -e "${GREEN}✅ Cleanup completed${NC}\n"
fi

# 4. Build das imagens Docker
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker_compose build app
echo -e "${GREEN}✅ Images built${NC}\n"

# 5. Subir PostgreSQL e Redis
echo -e "${YELLOW}🚀 Starting PostgreSQL and Redis...${NC}"
docker_compose up -d postgres redis

# 6. Aguardar PostgreSQL estar pronto
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
max_attempts=30
attempt=0
until docker_compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ PostgreSQL failed to start after ${max_attempts} attempts${NC}"
        docker_compose logs postgres
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo -e "\n${GREEN}✅ PostgreSQL is ready${NC}\n"

# 7. Aguardar Redis estar pronto
echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
max_attempts=30
attempt=0
until docker_compose exec -T redis redis-cli -a redis123 ping > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ Redis failed to start after ${max_attempts} attempts${NC}"
        docker_compose logs redis
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo -e "\n${GREEN}✅ Redis is ready${NC}\n"

# 8. Verificar se node_modules existe localmente (para IDE support)
if command -v yarn &> /dev/null; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies locally (for IDE support)...${NC}"
        yarn install
        echo -e "${GREEN}✅ Local dependencies installed${NC}\n"
    else
        echo -e "${GREEN}✅ node_modules already exists${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠️  Yarn not found locally. Skipping local dependencies installation.${NC}"
    echo -e "${YELLOW}   Dependencies will be installed inside Docker container.${NC}"
    echo -e "${YELLOW}   To install Yarn: npm install -g yarn${NC}\n"
fi

# 9. Gerar Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
docker_compose run --rm app yarn prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# 10. Rodar migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker_compose run --rm app yarn prisma migrate deploy
echo -e "${GREEN}✅ Migrations completed${NC}\n"

# 11. Seed inicial (opcional)
read -p "🌱 Run database seed? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    docker_compose run --rm app yarn db:seed
    echo -e "${GREEN}✅ Database seeded${NC}\n"
fi

# 12. Subir aplicação com hot-reload
echo -e "${YELLOW}🚀 Starting application with hot-reload...${NC}"
docker_compose up -d app

# 13. Aguardar app estar pronto
echo -e "${YELLOW}⏳ Waiting for application to be ready...${NC}"
max_attempts=60
attempt=0
until curl -s http://localhost:3000/health > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ Application failed to start after ${max_attempts} attempts${NC}"
        echo -e "${YELLOW}📋 Showing application logs:${NC}"
        docker_compose logs app
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo

# 14. Sucesso!
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          🎉 Setup Completed Successfully! 🎉         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "${BLUE}📍 Application URLs:${NC}"
echo -e "${GREEN}   API:${NC}                http://localhost:3000"
echo -e "${GREEN}   Swagger Docs:${NC}       http://localhost:3000/api"
echo -e "${GREEN}   Health Check:${NC}       http://localhost:3000/health"
echo

echo -e "${BLUE}🗄️  Database Access:${NC}"
echo -e "${GREEN}   Prisma Studio:${NC}      Run 'yarn prisma studio' or 'docker compose exec app yarn prisma studio'"
echo -e "${GREEN}   PostgreSQL:${NC}         localhost:5432 (user: postgres, pass: postgres)"
echo -e "${GREEN}   Redis:${NC}              localhost:6379 (pass: redis123)"
echo

echo -e "${BLUE}📝 Useful Commands:${NC}"
echo -e "   ${YELLOW}View logs:${NC}            docker compose logs -f app"
echo -e "   ${YELLOW}Stop all:${NC}             docker compose down"
echo -e "   ${YELLOW}Restart app:${NC}          docker compose restart app"
echo -e "   ${YELLOW}Run tests:${NC}            docker compose exec app yarn test"
echo -e "   ${YELLOW}Access container:${NC}     docker compose exec app sh"
echo -e "   ${YELLOW}Prisma Studio:${NC}        docker compose exec app yarn prisma studio"
echo

echo -e "${BLUE}🧪 Test Credentials (from seed):${NC}"
echo -e "${GREEN}   Email:${NC}     admin@example.com"
echo -e "${GREEN}   Password:${NC}  Admin@123"
echo

echo -e "${BLUE}📚 Quick Start Guide:${NC}"
echo -e "   1. Access Swagger:     ${GREEN}http://localhost:3000/api${NC}"
echo -e "   2. Login via POST /auth/login"
echo -e "   3. Copy the accessToken"
echo -e "   4. Click 'Authorize' button in Swagger"
echo -e "   5. Paste token and start testing!"
echo

echo -e "${YELLOW}💡 Tip: Check README.md for detailed API documentation${NC}\n"
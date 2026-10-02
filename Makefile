PNPM := $(shell which pnpm 2>/dev/null || echo ~/.local/bin/pnpm)

.PHONY: help dev build preview check lint format up down logs restart docker-build docker-up docker-down docker-logs

help:
	@echo "=========================================================="
	@echo "                 SAM Frontend Make Commands               "
	@echo "=========================================================="
	@echo "Local Development:"
	@echo "  make dev          - Start Vite dev server locally (http://localhost:5173)"
	@echo "  make build        - Compile TypeScript and build production bundle"
	@echo "  make preview      - Preview production build locally"
	@echo "  make check        - Run Biome lint & format check with auto-fix"
	@echo "  make lint         - Run Biome lint"
	@echo "  make format       - Format code using Biome"
	@echo ""
	@echo "Docker Container:"
	@echo "  make up           - Build and start container in background (http://localhost:3000)"
	@echo "  make down         - Stop and remove container"
	@echo "  make restart      - Restart container"
	@echo "  make logs         - View container logs in real time"
	@echo "  make docker-build - Build Docker image manually"
	@echo "=========================================================="

dev:
	$(PNPM) with current run dev

build:
	$(PNPM) with current run build

preview:
	$(PNPM) with current run preview

check:
	$(PNPM) with current run check

lint:
	$(PNPM) with current run lint

format:
	$(PNPM) with current run format

up: docker-up

down: docker-down

logs: docker-logs

restart:
	docker compose restart

docker-build:
	docker compose build

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f frontend

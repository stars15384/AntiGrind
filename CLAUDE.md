# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AntiGrind is a web application that allows consumers to make informed shopping decisions by exposing company work culture. Users can submit and view verified work hour data, overtime practices, and weekend policies for companies. The app calculates an "Anti-Grind Index" (AGI) score for each company - higher scores indicate more "grind" (worse work-life balance).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL + SQLAlchemy (async) |
| Cache | Redis (optional) |
| Graph DB | Neo4j (optional) |
| Search | Meilisearch (optional) |
| Storage | MinIO (optional) |

## Commands

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server (port 8000)
uvicorn app.main:app --reload

# Run tests
pytest

# Run a specific test
pytest tests/test_main.py::test_health_check
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install  # or pnpm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Infrastructure

```bash
# Start all infrastructure services
docker-compose up -d

# Stop all services
docker-compose down
```

## Architecture

### Backend Structure (`backend/app/`)

- **API Routes** (`api/`): Each domain has its own router - `auth`, `companies`, `work_hours`, `evidences`, `certifications`, `attendance`, `qa`, `rankings`, `admin`, `scan`, `features`
- **Services** (`services/`): Business logic including `agi_engine.py` (Anti-Grind Index calculation), `certification_service.py`, `company_service.py`, `ranking_service.py`
- **Models** (`models/`): SQLAlchemy ORM models in `models.py`
- **Schemas** (`schemas/`): Pydantic request/response models
- **Feature Flags** (`feature_flags.py`): JSON-based feature toggle system (see `backend/feature_flags.json`)

### Frontend Structure (`frontend/src/`)

- **Routes** (`app/routes.tsx`): React Router configuration with lazy-loaded pages
- **Components** (`app/components/`): Page components and UI components (radix-ui based)
- **API** (`api/`): TypeScript API clients matching backend endpoints
- **UI Components** (`app/components/ui/`): Reusable Radix UI + Tailwind components

### AGI Scoring System

The Anti-Grind Index is calculated in `backend/app/services/agi_engine.py` with the following weights:
- Work hours: 40% (≤40h = 0, 41-48h = 10, 49-60h = 30, 60h+ = 40)
- Weekend policy: 25% (double rest = 0, big small week = 10, single rest = 20, no rest = 25)
- Overtime compensation: 15% (legal = 0, fixed subsidy = 5, unpaid = 15)
- Shift policy: 10% (no shift = 0, occasional = 5, frequent = 10)
- Vibe score: 10% (user-provided rating 0-100)

### Feature Flags

Features are toggled via `backend/feature_flags.json`. Many infrastructure features (Redis, Neo4j, Meilisearch, MinIO) are disabled by default. Enable them in the JSON file before attempting to use those services.

### API Conventions

- All API responses follow `{ success: boolean, data?: any, error?: { code, message } }` format
- Exception handlers are centralized in `app/exception_handlers.py`
- Rate limiting uses `slowapi` with Redis backend
- CORS is configured via settings

## Key Files

- `backend/app/main.py` - FastAPI app factory and middleware setup
- `backend/app/config.py` - Settings management
- `backend/app/feature_flags.py` - Feature toggle system
- `backend/app/services/agi_engine.py` - AGI calculation logic
- `frontend/src/app/routes.tsx` - Route definitions
- `docker-compose.yml` - Infrastructure services
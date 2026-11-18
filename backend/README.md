# CyberIntel AI — Production FastAPI Backend

High-throughput, asynchronous forensic file analysis backend built with **FastAPI**, **Supabase PostgreSQL**, and pluggable **Python Analysis Modules**, designed to interface with the React + Vite frontend (`http://localhost:5173`) via Axios.

---

## 🏗️ Architecture & Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point, CORS, exception handlers & routing
│   ├── api/
│   │   └── routes/          # REST endpoints (/health, /files, /analysis)
│   ├── core/
│   │   ├── config.py        # Pydantic v2 BaseSettings & environment variables
│   │   ├── security.py      # Supabase JWT decoding, claims verification & auth dependency
│   │   └── errors.py        # Axios-compatible JSON error handlers
│   ├── db/
│   │   ├── schema.sql       # Supabase PostgreSQL schema, RLS policies & triggers
│   │   ├── session.py       # SQLAlchemy 2.0 async engine + asyncpg connection pool
│   │   ├── models.py        # Declarative ORM models (files, jobs, results)
│   │   └── supabase.py      # Supabase SDK client (Storage bucket integration)
│   ├── schemas/             # Pydantic v2 request & response schemas
│   ├── services/
│   │   ├── file_service.py      # File streaming, SHA-256 calculation & validation
│   │   └── analysis_service.py  # Asynchronous job dispatching & result ingestion
│   └── analysis/
│       ├── adapter.py       # Adapter layer connecting your Python modules as-is
│       └── mock_engine.py   # Heuristic entropy & forensic signature analyzer
├── tests/                   # Pytest async test suite
├── .env.example             # Environment variable template
├── requirements.txt         # Production dependencies
├── Dockerfile               # Multi-stage production container
└── README.md
```

---

## 🗄️ Database Strategy: Supabase + SQLAlchemy / asyncpg

### Why SQLAlchemy 2.0 + asyncpg?
We employ **`asyncpg` + `SQLAlchemy 2.0 (asyncio)`** as the primary database driver, while utilizing **`supabase-py`** for Supabase Storage buckets:
1. **Raw Performance**: Direct `asyncpg` binary TCP protocol is ~3–5x faster than routing DB queries through Supabase's HTTP PostgREST gateway.
2. **True Connection Pooling**: Native `pool_size` and `max_overflow` connection management configured for high concurrency.
3. **Transaction Safety**: Acid-compliant async context managers (`async with session: ...`) ensure multi-table rollbacks if an analysis job fails.
4. **Specialized Storage**: File binaries can be persisted directly to **Supabase Object Storage** buckets via `supabase-py` while PostgreSQL stores structured metadata and threat intelligence.

---

## 🚀 Quick Start (Local Development)

### 1. Create and Activate Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_KEY="<your-supabase-service-role-or-anon-key>"
SUPABASE_JWT_SECRET="<your-supabase-jwt-secret>"
DATABASE_URL="postgresql+asyncpg://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
```
*(Note: If `DATABASE_URL` is omitted in development, the backend automatically initializes a local `sqlite+aiosqlite` database for instant standalone testing).*

### 4. Apply Database Schema to Supabase
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the entire contents of [`app/db/schema.sql`](app/db/schema.sql) and execute it.
4. Go to **Storage** and ensure a bucket named `evidence-files` is created.

### 5. Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation will be available at:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🧩 Integrating Your Existing Python Analysis Modules

The adapter located in [`app/analysis/adapter.py`](app/analysis/adapter.py) is architected to call your Python modules **as-is without rewriting their internal logic**:

1. Place your Python file (e.g. `my_analyzer.py`) into `app/analysis/` or anywhere on the Python path.
2. Set the environment variable in `.env`:
   ```env
   CUSTOM_ANALYSIS_MODULE="app.analysis.my_analyzer"
   ```
3. Expose any standard entry-point function inside your file:
   ```python
   # my_analyzer.py
   def analyze(file_path: str):
       # Your proprietary file processing logic here
       return {
           "threat_score": 88,
           "verdict": "malicious",
           "summary": "Ransomware signature matched via proprietary algorithm",
           "indicators": [{"type": "c2", "value": "194.26.29.112", "severity": "high"}],
           "mitre_tactics": ["Command and Control (T1071)"]
       }
   ```
4. The adapter detects the function, executes it in an asynchronous background thread pool, normalizes the output, and writes the structured dossier to Supabase PostgreSQL.

---

## 📡 Axios Frontend Integration

The backend is fully configured for Axios calls originating from `http://localhost:5173`.

### Error Envelope
Whenever an error occurs, the backend returns a standardized JSON object that Axios catches in `error.response.data`:
```json
{
  "status": "error",
  "status_code": 404,
  "detail": "File with ID 'xyz' was not found",
  "path": "/api/files/xyz"
}
```

### Endpoints Summary

| Method | Endpoint | Description | Frontend Axios Example |
|---|---|---|---|
| `GET` | `/api/health` | Health & DB connectivity check | `api.get('/health')` |
| `POST` | `/api/files/upload` | Multipart file upload with SHA-256 | `api.post('/files/upload', formData)` |
| `GET` | `/api/files?page=1&page_size=20` | Paginated files per user | `api.get('/files', { params: { page: 1 } })` |
| `GET` | `/api/files/{id}` | Single file metadata | `api.get('/files/uuid-123')` |
| `DELETE` | `/api/files/{id}` | Delete file & artifacts | `api.delete('/files/uuid-123')` |
| `POST` | `/api/analysis/{file_id}` | Trigger background analysis (202 Accepted) | `api.post('/analysis/file-uuid')` |
| `GET` | `/api/analysis/{id}` | Poll analysis progress & final results | `api.get('/analysis/job-uuid')` |

---

## 🧪 Running Automated Tests

Run the test suite using `pytest`:
```bash
pytest -v
```

---

## 🐳 Docker Deployment

Build and run using Docker:
```bash
docker build -t cyberintel-backend .
docker run -p 8000:8000 --env-file .env cyberintel-backend
```

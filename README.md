# Enterprise Knowledge Assistant

Premium, enterprise-grade **Knowledge Assistant** with **RAG** (hybrid retrieval + citations), **RBAC**, and **observability**.

## Screenshots

### Home

![Home](/images/Home.png)

### Upload

![Upload](/images/Upload.png)

### Ask AI

![Ask AI](/images/AskAi.png)

### Metrics

![Metrics](/images/Metrics.png)

## Features

- **RAG retrieval**: hybrid search (vector + BM25) with confidence scoring
- **Citations**: chunk-level sources returned with relevance scores
- **RBAC**: document-level access control and filtering
- **Query rewriting**: improved retrieval quality (when provider available)
- **Observability**: metrics + latency breakdowns and provider distribution
- **Premium SaaS UI**: AI workspace layout, source panel, conversation history, markdown answers

## Startup (recommended)

### 1) Configure environment

Create `.env` in repo root (or copy from `.env.example`) and set at least:

```bash
cp .env.example .env
```

### 2) Start backend services (Docker)

```bash
docker compose up -d backend postgres redis celery_worker
```

### 3) Start frontend (local dev)

```bash
cd frontend
npm install
npm run dev
```

Open:
- **App**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`

## One-command start (optional)

```bash
./scripts/start-dev.sh
```

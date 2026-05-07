# Render Deployment Plan

This project can be deployed on [Render](https://render.com) using a **Blueprint** (`render.yaml`) with:

- **PostgreSQL** (managed)
- **Redis** (managed)
- **Backend + Worker (same service)** with a **persistent disk** for:
  - uploads (`/app/data/uploads`)
  - FAISS index + BM25 index (`/app/data/faiss_index`)
- **Frontend** (Next.js) as a web service

## Why backend + worker run together on Render

This codebase stores retrieval indexes (FAISS + BM25) on the local filesystem. Celery ingestion updates those index files.

On Render, separate services do **not** share disks. If you deploy the backend and worker as two services, they will not reliably see the same index files.

So the recommended Render deployment here is:

- **one backend web service** that runs **Celery worker + Uvicorn** in the same container and uses **one persistent disk** mounted at `/app/data`.

## Prerequisites

- A Render account
- A Git repository connected to Render (GitHub/GitLab)
- Either **OpenAI** or **Cerebras** API key

## Deploy (Blueprint)

1. Commit `render.yaml` and `DEPLOY_RENDER.md` to your repo.
2. In Render Dashboard:
   - **New** → **Blueprint**
   - Select the repo + branch
   - Review resources to be created
   - Click **Apply**
3. After deploy:
   - In `knowledgeai-frontend` service settings, set:
     - `NEXT_PUBLIC_API_BASE_URL` = `https://<knowledgeai-backend service hostname>`
       (Render cannot auto-inject a web URL into env vars from Blueprint)
   - Open the **backend** service URL and visit `/health`
   - Open the **frontend** service URL and try:
     - Upload a document
     - Ask a question

## Environment variables (what you must set)

The Blueprint wires `DATABASE_URL` and `REDIS_URL` automatically from Render-managed services.

You must set:

- `SECRET_KEY`: strong random string
- `LLM_PROVIDER`: `openai` or `cerebras`
- `OPENAI_API_KEY`: required if `LLM_PROVIDER=openai`
- `CEREBRAS_API_KEY`: required if `LLM_PROVIDER=cerebras`

Optional tuning:

- `TOP_K`
- `HYBRID_ALPHA`
- `CHUNK_SIZE`, `CHUNK_OVERLAP`
- `MAX_CONTEXT_TOKENS`

## Notes

- The backend enables permissive CORS (`*`). For production, restrict it to your Render frontend URL.
- Uploads + indexes persist on the Render disk mounted at `/app/data`.


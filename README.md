# Dubbed AI

Dubbed AI is a multilingual video-dubbing platform for independent creators and educators. It turns a finished source video into localized versions while keeping upload, processing progress, and completed downloads in one workspace.

./demo.mp4

## How it works

1. A creator registers or signs in; new accounts remain locked until an administrator approves them.
2. An approved creator uploads a video and chooses its source and target languages.
3. The API stores the source media in Cloudflare R2, creates a job in PostgreSQL, and publishes it to `pg-boss`.
4. A background worker transcribes and translates the speech, clones the voice, synthesizes the translated audio, and uses FFmpeg to mux it with the source video.
5. The creator tracks the job from pending through processing, completion, or failure, then downloads the result or adds another language version.

## Capabilities

- Email-and-password authentication with Better Auth
- Administrator approval for new accounts
- Direct video uploads to Cloudflare R2
- Source-language detection or selection and target-language selection
- Asynchronous dubbing jobs with persisted status and error details
- A workspace for tracking, downloading, and managing language versions

## Architecture

- **Frontend:** React, Vite, and TypeScript
- **Backend:** Express, Drizzle ORM, PostgreSQL, Better Auth, Cloudflare R2, and `pg-boss` job publishing
- **Worker:** TypeScript and `pg-boss`, with Sarvam for transcription and translation, Smallest for voice cloning and speech synthesis, Cloudflare R2 for media storage, and FFmpeg/ffprobe for media processing

## Repository map

```text
frontend/          React web application
backend/           Express API, authentication, persistence, and job publishing
worker/            Background dubbing pipeline and deployment configuration
docker-compose.yml Local PostgreSQL service
```

## Local development

Each service is an independent package. Copy its checked-in environment template before starting, then provide the required local credentials and service URLs:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp worker/.env.example worker/.env
```

Start PostgreSQL from the repository root with `docker compose up -d db`. Install dependencies in `frontend/`, `backend/`, and `worker/`, then use each package's scripts:

| Service | Development | Build | Other checks |
| --- | --- | --- | --- |
| Frontend | `npm run dev` | `npm run build` | `npm run lint`, `npm test` |
| Backend | `npm run dev` | `npm run build` | `npm run lint`, `npm test`, `npm run db:push` |
| Worker | `npm run dev` | `npm run build` | `npm test` |

The worker also requires FFmpeg and ffprobe on its runtime path. See [the worker deployment guide](worker/README.md) for its Docker-based deployment and operational commands.

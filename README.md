# Fastify API Server

SSE-enabled Fastify server with OpenAI-compatible endpoints.

## Quick Start

```bash
npm install
npm run dev      # Development (tsx watch)
npm run build    # Build (tsc)
npm start        # Production
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/messages` | SSE messages endpoint |
| POST | `/v1/chat/completions` | Chat completions endpoint |
| GET | `/v1/responses` | SSE responses endpoint |

## Tech Stack

- **Runtime**: Node.js with TypeScript (ESM)
- **Framework**: Fastify 5.x
- **Compression**: `@fastify/compress` 8.x (gzip/deflate)
- **Dev**: tsx watch mode

## Architecture

```
src/
├── index.ts           # Server entry, plugin registration
├── lib/
│   └── sse.ts         # SSE utilities (createSSEContext, writeSSEData, endSSEStream)
└── routes/
    ├── messages.ts
    ├── chat-completions.ts
    └── responses.ts
```

## Development Notes

- Streaming endpoints use `reply.hijack()` for raw response control
- SSE context automatically sets `Content-Encoding: gzip` and `Content-Type: text/event-stream`
- 30-second timeout on SSE connections (configurable)
- `@fastify/compress` version must be `^8.0.0` for Fastify 5.x compatibility

# Fastify API Server

SSE-enabled Fastify server with OpenAI-compatible endpoints.

## Quick Start

```bash
npm install
npm run dev      # Development (tsx watch mode)
npm run build    # TypeScript compilation
npm start        # Production (node dist/index.js)
```

## API Endpoints

| Method | Endpoint | Content-Type | Description |
|--------|----------|--------------|-------------|
| `GET` | `/health` | JSON | Health check |
| `POST` | `/v1/messages` | SSE streaming | Messages endpoint |
| `POST` | `/v1/chat/completions` | SSE streaming | Chat completions endpoint |
| `POST` | `/v1/responses` | SSE streaming | Responses endpoint |

All v1 endpoints accept POST only.

## Tech Stack

- **Runtime**: Node.js with TypeScript (ESM, `NodeNext` module resolution)
- **Framework**: Fastify 5.x
- **Compression**: `@fastify/compress` 8.x (gzip/deflate)
- **Dev**: tsx watch mode
- **Port**: 3000 (hardcoded)

## Architecture

```
src/
├── index.ts           # Server entry, plugin registration
├── lib/
│   ├── sse.ts         # SSE utilities (createSSEContext, writeSSEData, endSSEStream)
│   └── cert.ts        # Self-signed cert generation for HTTPS
└── routes/
    ├── messages.ts
    ├── chat-completions.ts
    └── responses.ts
```

## HTTPS

Server auto-generates self-signed certificates in `./certs/` on first run (requires `openssl`).

## Key Patterns

### Route Registration
```typescript
// CORRECT - nested register with prefix once
fastify.register(async (fastify) => {
  fastify.register(messagesRoute);
}, { prefix: '/v1' });

// WRONG - would create /v1/v1/messages
fastify.register(messagesRoute, { prefix: '/v1' });
```

### SSE Streaming with gzip
```typescript
reply.hijack();
const { gzip, cleanup } = createSSEContext(reply.raw);
await writeSSEData(gzip, `data: ${json}\n\n`);
endSSEStream(gzip);
```

### Error Logging (Fastify 5.x)
```typescript
// CORRECT
fastify.log.error({ err }, 'message');

// WRONG - 5.x doesn't support interpolated params
fastify.log.error('message', err);
```

## Gotchas

- `@fastify/compress` must be `^8.0.0` for Fastify 5.x. Version 7.x throws `FST_ERR_PLUGIN_VERSION_MISMATCH`
- Streaming endpoints use `reply.hijack()` - standard reply methods won't work after hijack
- `createSSEContext` sets `Content-Encoding: gzip` + `Content-Type: text/event-stream` headers automatically
- 30-second timeout on SSE connections (configurable via second param to `createSSEContext`)

## Contributing

1. Follow existing code patterns
2. Run `npm run build` before committing
3. Test streaming endpoints with SSE clients
# AGENTS.md

## Dev Commands

```bash
npm run dev    # tsx watch mode (development)
npm run build  # tsc compilation
npm start      # node dist/index.js (production)
```

## Architecture

- **TypeScript** with `NodeNext` module resolution, ESM (`"type": "module"`)
- **Fastify 5.x** with `@fastify/compress` 8.x (required for compatibility)
- **SSE endpoints**: `/v1/messages`, `/v1/chat/completions`, `/v1/responses`
- **Entry**: `src/index.ts`, routes in `src/routes/`, shared SSE utilities in `src/lib/sse.ts`

## Key Patterns

### Route registration (avoid double prefix)
```typescript
// CORRECT - nested register with prefix once
fastify.register(async (fastify) => {
  fastify.register(messagesRoute);
}, { prefix: '/v1' });

// WRONG - would create /v1/v1/messages
fastify.register(messagesRoute, { prefix: '/v1' });
```

### SSE streaming with gzip
All streaming endpoints use `reply.hijack()` for raw response control + gzip compression via `src/lib/sse.ts`:
```typescript
reply.hijack();
const { gzip, cleanup } = createSSEContext(reply.raw);
// write via gzip pipeline
await writeSSEData(gzip, `data: ${json}\n\n`);
endSSEStream(gzip);
```

### Error logging (Fastify 5.x compatible)
```typescript
// CORRECT
fastify.log.error({ err }, 'message');

// WRONG - 5.x doesn't support interpolated params this way
fastify.log.error('message', err);
```

## Gotchas

- `@fastify/compress` must be `^8.0.0` for Fastify 5.x. Version 7.x throws `FST_ERR_PLUGIN_VERSION_MISMATCH`
- Streaming endpoints use hijack() - standard reply methods won't work
- `createSSEContext` sets `Content-Encoding: gzip` + `text/event-stream` headers automatically
- 30-second timeout on SSE connections (configurable via second param)

## Project Structure

```
src/
├── index.ts           # Fastify server, compress plugin, route registration
├── lib/
│   └── sse.ts         # SSE utilities: createSSEContext, writeSSEData, endSSEStream
└── routes/
    ├── messages.ts
    ├── chat-completions.ts
    └── responses.ts
```
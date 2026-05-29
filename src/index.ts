import Fastify from 'fastify';
import compress from '@fastify/compress';
import { messagesRoute } from './routes/messages.js';
import { chatCompletionsRoute } from './routes/chat-completions.js';
import { responsesRoute } from './routes/responses.js';

const fastify = Fastify({
  logger: true,
  disableRequestLogging: true,
});

await fastify.register(compress, {
  encodings: ['gzip', 'deflate'],
});

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.register(async (fastify) => {
  fastify.register(messagesRoute);
  fastify.register(chatCompletionsRoute);
  fastify.register(responsesRoute);
}, { prefix: '/v1' });

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
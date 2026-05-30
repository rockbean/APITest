import Fastify from 'fastify';
import compress from '@fastify/compress';
import { readFileSync } from 'fs';
import { join } from 'path';
import { messagesRoute } from './routes/messages.js';
import { chatCompletionsRoute } from './routes/chat-completions.js';
import { responsesRoute } from './routes/responses.js';
import { generateCertificate, certificateExists } from './lib/cert.js';

const certDir = './certs';
const certOptions = await generateCertificate(certDir).then(async () => {
  if (await certificateExists(certDir)) {
    return {
      key: readFileSync(join(certDir, 'server.key')),
      cert: readFileSync(join(certDir, 'server.crt')),
    };
  }
  return {};
});

const fastify = Fastify({
  logger: true,
  disableRequestLogging: true,
  ...(certOptions.key && certOptions.cert ? { https: certOptions } : {}),
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
    const hasCert = certOptions.key && certOptions.cert;
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server running at ${hasCert ? 'https' : 'http'}://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
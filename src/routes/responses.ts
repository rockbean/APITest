import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createSSEContext, writeSSEData, endSSEStream } from '../lib/sse.js';

export const responsesRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/responses', async (request, reply) => {
    reply.hijack();

    const { gzip, cleanup } = createSSEContext(reply.raw);
    const body = request.body as Record<string, unknown> | null;

    try {
      const chunkData = JSON.stringify({
        id: 'resp_' + Date.now(),
        object: 'response',
        model: 'test-model',
        choices: [{
          index: 0,
          delta: { content: `Received: ${JSON.stringify(body)}` },
          finish_reason: null
        }]
      });
      await writeSSEData(gzip, `data: ${chunkData}\n\n`);

      const doneData = JSON.stringify({
        id: 'resp_' + Date.now(),
        object: 'response',
        model: 'test-model',
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
      });
      await writeSSEData(gzip, `data: ${doneData}\n\n`);
      await writeSSEData(gzip, `data: [DONE]\n\n`);
      endSSEStream(gzip);
    } catch (err) {
      fastify.log.error({ err }, 'Failed to write SSE data');
      cleanup();
    }
  });
};
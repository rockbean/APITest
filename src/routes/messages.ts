import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createSSEContext, writeSSEData, endSSEStream } from '../lib/sse.js';

export const messagesRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/messages', async (request, reply) => {
    reply.hijack();

    const { gzip, cleanup } = createSSEContext(reply.raw);
    const body = request.body as { messages?: string } | null;
    const inputMessage = body?.messages ?? '';

    try {
      const messageData = JSON.stringify({
        id: 'msg_' + Date.now(),
        type: 'message',
        role: 'assistant',
        content: `Received: ${inputMessage}`,
        request: body,
      });
      await writeSSEData(gzip, `data: ${messageData}\n\n`);
      await writeSSEData(gzip, `data: [DONE]\n\n`);
      endSSEStream(gzip);
    } catch (err) {
      fastify.log.error({ err }, 'Failed to write SSE data');
      cleanup();
    }
  });
};
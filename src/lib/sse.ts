import { createGzip } from 'node:zlib';
import type { Gzip } from 'node:zlib';
import type { OutgoingMessage } from 'node:http';

export interface SSEContext {
  gzip: Gzip;
  cleanup: () => void;
}

export function createSSEContext(
  rawRes: OutgoingMessage,
  timeoutMs: number = 30000
): SSEContext {
  // 设置响应头
  rawRes.setHeader('Content-Type', 'text/event-stream');
  rawRes.setHeader('Cache-Control', 'no-cache');
  rawRes.setHeader('Connection', 'keep-alive');
  rawRes.setHeader('Content-Encoding', 'gzip');

  // 创建 gzip 压缩流
  const gzip = createGzip();
  gzip.pipe(rawRes);

  // 清理资源
  let timeoutId: NodeJS.Timeout | null = null;

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    gzip.destroy();
    if (!rawRes.writableEnded) rawRes.end();
  };

  rawRes.on('close', cleanup);
  rawRes.on('error', cleanup);

  // 设置超时
  timeoutId = setTimeout(() => {
    cleanup();
  }, timeoutMs);

  return { gzip, cleanup };
}

export async function writeSSEData(
  gzip: Gzip,
  data: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    gzip.write(data, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function endSSEStream(gzip: Gzip): void {
  gzip.end();
}
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, access, constants } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function certificateExists(dir: string): Promise<boolean> {
  try {
    await access(join(dir, 'server.key'), constants.F_OK);
    await access(join(dir, 'server.crt'), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function generateCertificate(dir: string): Promise<void> {
  const { mkdir } = await import('fs/promises');
  await mkdir(dir, { recursive: true });

  const exists = await certificateExists(dir);
  if (exists) return;

  const keyPath = join(dir, 'server.key');
  const certPath = join(dir, 'server.crt');

  await execAsync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
  );
}
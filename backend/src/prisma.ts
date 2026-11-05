import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded regardless of launch directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl) {
  // Ensure connection parameters are optimized for pooled proxy
  const urlObj = new URL(dbUrl);
  urlObj.searchParams.set('connect_timeout', '60');
  urlObj.searchParams.set('pool_timeout', '0');
  urlObj.searchParams.set('connection_limit', '5');
  dbUrl = urlObj.toString();
  process.env.DATABASE_URL = dbUrl;
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ||
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Automatic retry wrapper for serverless and connection pool cold-start resiliency
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isConnectionIssue =
        err.message?.includes('pooled.db.prisma.io') ||
        err.message?.includes('database server') ||
        err.message?.includes('connection pool') ||
        err.message?.includes('Timed out fetching') ||
        err.code === 'P1001' ||
        err.code === 'P1002' ||
        err.code === 'P1003' ||
        err.code === 'P1008' ||
        err.code === 'P1017' ||
        err.code === 'P2024';

      if (i < retries - 1 && isConnectionIssue) {
        console.warn(`[Prisma DB Pool] Transient connection issue (${err.code || 'timeout'}), retrying in ${delayMs}ms... (attempt ${i + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

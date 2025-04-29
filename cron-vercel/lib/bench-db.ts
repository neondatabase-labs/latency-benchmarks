import "dotenv/config";
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

interface BenchDbConfig {
  connectionUrl: string;
  connectionMethod: string;
}

export function getBenchDb({ connectionUrl, connectionMethod }: BenchDbConfig) {
  if (!connectionUrl) {
    throw new Error('Connection URL is required');
  }

  if (connectionMethod === 'ws') {
    return new Pool({ connectionString: connectionUrl });
  }

  neonConfig.webSocketConstructor = undefined;
  return neon(connectionUrl);
}

export async function measureLatency(connectionUrl: string, connectionMethod: 'ws' | 'http'): Promise<number> {
  const client = getBenchDb({ connectionUrl, connectionMethod });
  
  try {
    const startTime = performance.now();
    if (client instanceof Pool) {
      await client.query('SELECT 1');
    } else {
      await client`SELECT 1`;
    }
    return performance.now() - startTime;
  } catch (error) {
    console.error(`Error measuring latency:`, error);
    throw error;
  }
}

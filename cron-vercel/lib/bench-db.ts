import "dotenv/config";
import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

interface BenchDbConfig {
  connectionUrl: string;
  connectionMethod: string;
}

// Cache for TCP connection pools to enable reuse across requests
const tcpPools = new Map<string, PgPool>();

export function getTcpPool(connectionUrl: string): PgPool {
  if (!tcpPools.has(connectionUrl)) {
    const pool = new PgPool({ connectionString: connectionUrl });
    attachDatabasePool(pool);
    tcpPools.set(connectionUrl, pool);
  }
  return tcpPools.get(connectionUrl)!;
}

export function getBenchDb({ connectionUrl, connectionMethod }: BenchDbConfig) {
  if (!connectionUrl) {
    throw new Error("Connection URL is required");
  }

  if (connectionMethod === "tcp") {
    return getTcpPool(connectionUrl);
  }

  if (connectionMethod === "ws") {
    return new NeonPool({ connectionString: connectionUrl });
  }

  neonConfig.webSocketConstructor = undefined;
  return neon(connectionUrl);
}

export async function measureLatency(
  connectionUrl: string,
  connectionMethod: "ws" | "http" | "tcp",
): Promise<number> {
  const client = getBenchDb({ connectionUrl, connectionMethod });

  try {
    const startTime = performance.now();
    if (client instanceof NeonPool || client instanceof PgPool) {
      await client.query("SELECT 1");
    } else {
      await client`SELECT 1`;
    }
    return performance.now() - startTime;
  } catch (error) {
    console.error(`Error measuring latency:`, error);
    throw error;
  }
}

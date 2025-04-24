import "dotenv/config";
import { neon, NeonQueryFunction, neonConfig } from '@neondatabase/serverless';

neonConfig.poolQueryViaFetch = true;

const BENCH_DB_US_WEST_2 = process.env.BENCH_DB_US_WEST_2;
const BENCH_DB_US_EAST_1 = process.env.BENCH_DB_US_EAST_1;

interface Todo {
  id: number;
  title: string;
  created_at: Date;
  completed: boolean;
}

export function getBenchDb(regionCode: string): NeonQueryFunction<false, false> {
  let dbUrl = '';
  if (regionCode === "us-west-2") {
    dbUrl = BENCH_DB_US_WEST_2 || '';
  } else if (regionCode === "us-east-1") {
    dbUrl = BENCH_DB_US_EAST_1 || '';
  }
  if (!dbUrl) {
    throw new Error(`BENCH_DATABASE_URL_${regionCode} is not set`);
  }
  return neon(dbUrl);
}

/**
 * Measure the latency of querying todos
 * Returns the latency in milliseconds
 */
export async function measureLatency(regionCode: string): Promise<number> {
  const db = getBenchDb(regionCode);
  const start = performance.now();
  try {
    await db`SELECT 1`;
    const end = performance.now();
    return end - start;
  } catch (error) {
    console.error(`Error measuring latency for region ${regionCode}:`, error);
    throw error;
  }
}

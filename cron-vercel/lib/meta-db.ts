import "dotenv/config";
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const sql = neon(process.env.DATABASE_URL);

interface Database {
  id: number;
  name: string;
  provider: string;
  region_code: string;
  region_label: string;
  connection_method: 'ws' | 'http';
  connection_url: string;
  neon_project_id: string;
}

type Platform = 'vercel';

interface Function {
  id: number;
  name: string;
  region_code: string;
  region_label: string;
  platform: Platform;
}

interface Stat {
  id: number;
  date_time: Date;
  function_id: number;
  database_id: number;
  latency_ms: number;
  query_type: 'cold' | 'hot';
}

/**
 * Fetch all databases for a specific function
 */
export async function getAllDatabases(functionId: number): Promise<Database[]> {
  const result = await sql`
    SELECT id, name, provider, region_code, region_label, connection_method, connection_url, neon_project_id
    FROM databases
    WHERE function_id = ${functionId}
  ` as Database[];
  return result;
}

/**
 * Get a function by region code
 */
export async function getFunctionByRegionCode(regionCode: string): Promise<Function> {
  const result = await sql`
    SELECT id, name, region_code, region_label, platform
    FROM functions
    WHERE region_code = ${regionCode}
  ` as Function[];
  return result[0];
}

/**
 * Add a new latency measurement
 */
export async function addLatencyMeasurement(
  functionId: number,
  databaseId: number,
  latencyMs: number,
  queryType: 'cold' | 'hot'
): Promise<Stat> {
  const result = await sql`
    INSERT INTO stats (date_time, function_id, database_id, latency_ms, query_type)
    VALUES (NOW(), ${functionId}, ${databaseId}, ${latencyMs}, ${queryType})
    RETURNING id, date_time, function_id, database_id, latency_ms, query_type
  ` as Stat[];
  return result[0];
}

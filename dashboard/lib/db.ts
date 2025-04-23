import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { and, desc, eq, gte } from "drizzle-orm";
import { databases, functions, stats, type Database, type Function, type Stat } from "./schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

/**
 * Get all databases
 */
export async function getAllDatabases(): Promise<Database[]> {
  return await db.select().from(databases);
}

/**
 * Get all functions
 */
export async function getAllFunctions(): Promise<Function[]> {
  return await db.select().from(functions);
}

/**
 * Get stats for the last 24 hours for a specific database
 */
export async function getLastDayStats(databaseId: number): Promise<Stat[]> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return await db
    .select()
    .from(stats)
    .where(
      and(
        eq(stats.databaseId, databaseId),
        gte(stats.dateTime, oneDayAgo)
      )
    )
    .orderBy(desc(stats.dateTime));
}

/**
 * Get stats for the last 30 days for a specific database
 */
export async function getLast30DaysStats(databaseId: number): Promise<Stat[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await db
    .select()
    .from(stats)
    .where(
      and(
        eq(stats.databaseId, databaseId),
        gte(stats.dateTime, thirtyDaysAgo)
      )
    )
    .orderBy(desc(stats.dateTime));
}

/**
 * Get stats with database and function details
 */
export async function getStatsWithDetails(stats: Stat[]): Promise<(Stat & { database: Database; function: Function })[]> {
  const databaseIds = new Set(stats.map(stat => stat.databaseId));
  const functionIds = new Set(stats.map(stat => stat.functionId));

  const [dbDetails, functionDetails] = await Promise.all([
    db.select().from(databases).where(eq(databases.id, Array.from(databaseIds)[0])),
    db.select().from(functions).where(eq(functions.id, Array.from(functionIds)[0]))
  ]);

  const dbMap = new Map(dbDetails.map(db => [db.id, db]));
  const functionMap = new Map(functionDetails.map(fn => [fn.id, fn]));

  return stats.map(stat => ({
    ...stat,
    database: dbMap.get(stat.databaseId)!,
    function: functionMap.get(stat.functionId)!
  }));
}
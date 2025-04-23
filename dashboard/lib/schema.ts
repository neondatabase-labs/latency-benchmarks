import { 
  timestamp,
  pgTable, 
  varchar,
  integer,
  serial,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Databases table
export const databases = pgTable('databases', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  regionCode: varchar('region_code', { length: 50 }).notNull(),
  regionLabel: varchar('region_label', { length: 255 }).notNull(),
});

// Functions table
export const functions = pgTable('functions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  region: varchar('region', { length: 50 }).notNull(),
  connectionMethod: varchar('connection_method', { length: 50 }).notNull(),
});

// Stats table
export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  dateTime: timestamp('date_time').notNull(),
  functionId: integer('function_id')
    .references(() => functions.id)
    .notNull(),
  databaseId: integer('database_id')
    .references(() => databases.id)
    .notNull(),
  latencyMs: decimal('latency_ms', { precision: 10, scale: 2 }).notNull(),
});

// Zod Schemas for type inference and validation
export const insertDatabaseSchema = createInsertSchema(databases);
export const selectDatabaseSchema = createSelectSchema(databases);

export const insertFunctionSchema = createInsertSchema(functions);
export const selectFunctionSchema = createSelectSchema(functions);

export const insertStatSchema = createInsertSchema(stats);
export const selectStatSchema = createSelectSchema(stats);

// TypeScript types
export type Database = z.infer<typeof selectDatabaseSchema>;
export type NewDatabase = z.infer<typeof insertDatabaseSchema>;

export type Function = z.infer<typeof selectFunctionSchema>;
export type NewFunction = z.infer<typeof insertFunctionSchema>;

export type Stat = z.infer<typeof selectStatSchema>;
export type NewStat = z.infer<typeof insertStatSchema>;

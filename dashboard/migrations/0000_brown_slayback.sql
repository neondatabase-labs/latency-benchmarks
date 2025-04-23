CREATE TABLE "databases" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"region_code" varchar(50) NOT NULL,
	"region_label" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "functions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"region" varchar(50) NOT NULL,
	"connection_method" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_time" timestamp NOT NULL,
	"function_id" integer NOT NULL,
	"database_id" integer NOT NULL,
	"latency_ms" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_function_id_functions_id_fk" FOREIGN KEY ("function_id") REFERENCES "public"."functions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_database_id_databases_id_fk" FOREIGN KEY ("database_id") REFERENCES "public"."databases"("id") ON DELETE no action ON UPDATE no action;
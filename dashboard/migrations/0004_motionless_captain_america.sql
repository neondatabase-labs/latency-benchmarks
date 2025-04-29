CREATE TYPE "public"."connection_method" AS ENUM('http', 'ws');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('vercel');--> statement-breakpoint
ALTER TABLE "databases" ADD COLUMN "function_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "databases" ADD COLUMN "connection_method" "connection_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "databases" ADD COLUMN "connection_url" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "databases" ADD COLUMN "neon_project_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "functions" ADD COLUMN "platform" "platform" NOT NULL;--> statement-breakpoint
ALTER TABLE "databases" ADD CONSTRAINT "databases_function_id_functions_id_fk" FOREIGN KEY ("function_id") REFERENCES "public"."functions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "functions" DROP COLUMN "vercel_region_code";--> statement-breakpoint
ALTER TABLE "functions" DROP COLUMN "connection_method";--> statement-breakpoint
ALTER TABLE "databases" ADD CONSTRAINT "databases_function_id_connection_method_region_code_unique" UNIQUE("function_id","connection_method","region_code");
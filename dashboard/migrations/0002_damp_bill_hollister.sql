CREATE TYPE "public"."query_type" AS ENUM('cold', 'hot');--> statement-breakpoint
ALTER TABLE "stats" ADD COLUMN "query_type" "query_type" NOT NULL;
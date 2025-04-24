ALTER TABLE "functions" ADD COLUMN "region_code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "functions" ADD COLUMN "region_label" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "functions" DROP COLUMN "region";
ALTER TABLE "simulation" ADD COLUMN "kind" text DEFAULT 'projection' NOT NULL;--> statement-breakpoint
ALTER TABLE "short_link" ADD COLUMN "kind" text DEFAULT 'projection' NOT NULL;
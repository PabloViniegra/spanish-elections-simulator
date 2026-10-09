CREATE TABLE "short_link" (
	"id" text PRIMARY KEY NOT NULL,
	"scenario" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "dynamic_canvas_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"json" text NOT NULL,
	"height" integer NOT NULL,
	"width" integer NOT NULL,
	"thumbnailUrl" text,
	"isPro" boolean DEFAULT false NOT NULL,
	"category" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);

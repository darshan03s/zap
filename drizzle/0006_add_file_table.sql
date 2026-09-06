CREATE TYPE "public"."file_type" AS ENUM('file', 'directory');--> statement-breakpoint
CREATE TABLE "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"parent_id" uuid,
	"type" "file_type" NOT NULL,
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_file_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "files_project_path_unique" ON "file" USING btree ("project_id","path");--> statement-breakpoint
CREATE INDEX "files_parent_idx" ON "file" USING btree ("project_id","parent_id");--> statement-breakpoint
CREATE INDEX "files_path_idx" ON "file" USING btree ("project_id","path");
CREATE TABLE "generation_limit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"generation_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_limit" ADD CONSTRAINT "generation_limit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_limit_userId_idx" ON "generation_limit" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "generation_limit_user_unique" ON "generation_limit" USING btree ("user_id");
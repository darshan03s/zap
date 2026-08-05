CREATE TYPE "public"."api_key_mode" AS ENUM('free', 'byok');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('vercel_ai_gateway', 'openai', 'anthropic', 'google');--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"provider" "provider" NOT NULL,
	"api_key_mode" "api_key_mode" NOT NULL,
	"key" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_key_userId_idx" ON "api_key" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_key_user_provider_unique" ON "api_key" USING btree ("user_id","provider");
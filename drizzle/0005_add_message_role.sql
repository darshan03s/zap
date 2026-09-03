CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "role" "message_role" NOT NULL;
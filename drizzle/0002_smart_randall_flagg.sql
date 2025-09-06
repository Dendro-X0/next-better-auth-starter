ALTER TABLE "user" RENAME COLUMN "display_username" TO "two_factor_secret";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_backup_codes" text;
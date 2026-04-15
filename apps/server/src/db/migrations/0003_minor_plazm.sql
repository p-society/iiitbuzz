ALTER TABLE "post" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "branch" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "is_rejected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "is_draft" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "is_anonymous" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "is_approved" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "is_rejected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "topic" ADD COLUMN "category" varchar(50) DEFAULT 'Official';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" varchar(20) DEFAULT 'user';--> statement-breakpoint
CREATE INDEX "idx_post_is_draft" ON "post" USING btree ("is_draft");
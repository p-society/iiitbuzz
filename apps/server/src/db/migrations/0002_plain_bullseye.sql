CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"thread_id" uuid,
	"from_user_id" uuid,
	"message" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vote_id_unique" UNIQUE("id"),
	CONSTRAINT "vote_user_post_unique" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "vote" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "is_approved" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "view_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "view_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "thread_title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "topic_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "topic_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "is_anonymous" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_url" varchar(500);--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notification_user_id" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_read" ON "notification" USING btree ("read");--> statement-breakpoint
CREATE INDEX "idx_notification_created_at" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vote_user_id" ON "vote" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vote_post_id" ON "vote" USING btree ("post_id");
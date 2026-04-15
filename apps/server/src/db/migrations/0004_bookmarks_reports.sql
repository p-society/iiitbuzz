CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmark_id_unique" UNIQUE("id"),
	CONSTRAINT "bookmark_user_thread_unique" UNIQUE("user_id","thread_id")
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	CONSTRAINT "report_id_unique" UNIQUE("id"),
	CONSTRAINT "report_user_post_unique" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "is_approved" SET DEFAULT true;
--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_bookmark_user_id" ON "bookmark" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_bookmark_thread_id" ON "bookmark" USING btree ("thread_id");
--> statement-breakpoint
CREATE INDEX "idx_report_user_id" ON "report" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_report_post_id" ON "report" USING btree ("post_id");
--> statement-breakpoint
CREATE INDEX "idx_report_status" ON "report" USING btree ("status");

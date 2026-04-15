import {
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { posts } from "./post.schema";
import { users } from "./user.schema";

export const reports = pgTable(
	"report",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id)
			.notNull(),
		postId: uuid("post_id")
			.references(() => posts.id)
			.notNull(),
		status: text("status").notNull().default("pending"),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
		resolvedAt: timestamp("resolved_at", { mode: "string" }),
		resolvedBy: uuid("resolved_by").references(() => users.id),
	},
	(table) => [
		unique("report_user_post_unique").on(table.userId, table.postId),
		index("idx_report_user_id").on(table.userId),
		index("idx_report_post_id").on(table.postId),
		index("idx_report_status").on(table.status),
	],
);

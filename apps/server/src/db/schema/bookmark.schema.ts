import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { threads } from "./thread.schema";
import { users } from "./user.schema";

export const bookmarks = pgTable(
	"bookmark",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id)
			.notNull(),
		threadId: uuid("thread_id")
			.references(() => threads.id)
			.notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("bookmark_user_thread_unique").on(table.userId, table.threadId),
		index("idx_bookmark_user_id").on(table.userId),
		index("idx_bookmark_thread_id").on(table.threadId),
	],
);

import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { threads } from "./thread.schema";
import { users } from "./user.schema";

export const notifications = pgTable(
	"notification",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id)
			.notNull(),
		type: text("type").notNull(),
		threadId: uuid("thread_id").references(() => threads.id),
		fromUserId: uuid("from_user_id").references(() => users.id),
		message: text("message"),
		read: boolean("read").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("idx_notification_user_id").on(table.userId),
		index("idx_notification_read").on(table.read),
		index("idx_notification_created_at").on(table.createdAt),
	],
);

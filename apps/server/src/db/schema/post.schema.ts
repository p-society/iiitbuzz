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

export const posts = pgTable(
	"post",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),

		threadId: uuid("thread_id")
			.references(() => threads.id)
			.notNull(),

		vote: integer("vote").default(0),
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		deletedAt: timestamp("deleted_at", { mode: "string" }),

		createdBy: uuid("created_by")
			.references(() => users.id)
			.notNull(),
		updatedBy: uuid("updated_by").references(() => users.id),
		deletedBy: uuid("deleted_by").references(() => users.id),

		isApproved: boolean("is_approved").default(false),
	},
	(table) => [
		index("idx_post_created_by").on(table.createdBy),
		index("idx_post_updated_by").on(table.updatedBy),
		index("idx_post_created_at").on(table.createdAt),
	],
);

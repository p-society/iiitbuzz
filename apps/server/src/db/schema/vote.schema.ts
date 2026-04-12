import {
	index,
	integer,
	pgTable,
	timestamp,
	uuid,
	unique,
} from "drizzle-orm/pg-core";
import { posts } from "./post.schema";
import { users } from "./user.schema";

export const votes = pgTable(
	"vote",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id)
			.notNull(),
		postId: uuid("post_id")
			.references(() => posts.id)
			.notNull(),
		value: integer("value").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("vote_user_post_unique").on(table.userId, table.postId),
		index("idx_vote_user_id").on(table.userId),
		index("idx_vote_post_id").on(table.postId),
	],
);

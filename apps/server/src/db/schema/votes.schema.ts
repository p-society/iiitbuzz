import { pgTable, uniqueIndex, uuid,timestamp,boolean, } from "drizzle-orm/pg-core";
import { posts } from "./post.schema";
import { users } from "./user.schema";
export const votes = pgTable(
  "vote",
  {
	//composite Key:userId, postId
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    isUpvote: boolean("is_upvote").notNull().default(false),
    isDownvote: boolean("is_downvote").notNull().default(false),
    deletedAt: timestamp("deleted_at", { mode: "string" }),

  },
  (table) => ({
    pk: uniqueIndex("vote_pk").on(table.userId, table.postId),
  })
);

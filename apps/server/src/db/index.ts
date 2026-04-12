import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../envSchema";
import { posts } from "./schema/post.schema";
import { threads } from "./schema/thread.schema";
import { topics } from "./schema/topic.schema";
import { users } from "./schema/user.schema";
import { votes } from "./schema/vote.schema";
import { notifications } from "./schema/notification.schema";

export const DrizzleClient = drizzle(env.DATABASE_URL, {
	schema: { users, topics, threads, posts, votes, notifications },
});

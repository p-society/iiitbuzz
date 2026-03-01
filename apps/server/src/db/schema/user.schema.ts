import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
	id: uuid("id").primaryKey().notNull().unique(),
	username: varchar("username", { length: 255 }).unique(),
	email: varchar("email", { length: 255 }).unique(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	imageUrl: varchar("image_url", { length: 500 }),
	totalPosts: integer("total_posts"),
	pronouns: varchar("pronouns", { length: 64 }),
	bio: varchar("bio", { length: 255 }),
	branch: varchar("branch", { length: 5 }),
	passingOutYear: varchar("passing_out_year", { length: 4 }),
});

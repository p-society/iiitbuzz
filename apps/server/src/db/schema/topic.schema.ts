import {
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const topics = pgTable(
	"topic",
	{
		id: uuid("id").primaryKey().notNull().unique().defaultRandom(),

		topicName: varchar("topic_name", { length: 255 }).notNull(),
		topicDescription: text("topic_description").notNull(),
		category: varchar("category", { length: 50 }).default("Official"),

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
	},
	(table) => [
		index("idx_topic_created_by").on(table.createdBy),
		// index("idx_topic_updated_by").on(table.updatedBy),
		// index("idx_topic_created_at").on(table.createdAt),
	],
);

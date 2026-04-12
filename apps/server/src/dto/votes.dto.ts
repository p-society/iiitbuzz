import { z } from "zod";
import type { votes } from "@/db/schema/vote.schema";

export type Vote = typeof votes.$inferSelect;

export const voteSchema = z.object({
	postId: z.string().uuid(),
	value: z.number().int().min(-1).max(1),
});

export const postIdParamsSchema = z.object({
	postId: z.string().uuid(),
});

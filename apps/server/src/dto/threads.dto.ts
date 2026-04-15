import { z } from "zod";
import type { threads } from "@/db/schema/thread.schema";

export type Thread = typeof threads.$inferSelect;

// threadIdParamsSchema already declared above

export const createThreadSchema = z.object({
	threadTitle: z.string().min(1).max(255),
	topicId: z.string().uuid(),
	content: z.string().min(1, "Content is required").max(10_000),
	isAnonymous: z.boolean().optional().default(false),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;

export const updateThreadSchema = z
	.object({
		threadTitle: z.string().min(1).max(255).optional(),
		// optionally allow moving thread to another topic
		topicId: z.string().uuid().optional(),
		// lock/pin handled by separate endpoints in many systems, skip for now
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided",
	});
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;

export const threadIdParamsSchema = z.object({
	id: z.string().uuid(),
});

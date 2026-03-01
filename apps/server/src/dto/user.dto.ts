import { z } from "zod";
import type { users } from "@/db/schema/user.schema";

export type User = typeof users.$inferSelect;
export const userDetailsParamsSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(32)
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Only letters, numbers, and underscore are allowed",
		),
});
export type UserDetailsParams = z.infer<typeof userDetailsParamsSchema>;

export const userIdParamsSchema = z.object({
	id: z.string().uuid(),
});
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export const userUpdateSchema = z
	.object({
		username: z
			.string()
			.min(3)
			.max(32)
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Only letters, numbers, and underscore are allowed",
			)
			.optional(),
		firstName: z.string().max(50).nullable().optional(),
		lastName: z.string().max(50).nullable().optional(),
		imageUrl: z.string().url().or(z.string().startsWith("/images/")).optional(),
		pronouns: z.string().max(50).nullable().optional(),
		bio: z.string().max(280).nullable().optional(),
		branch: z.string().max(100).nullable().optional(),
		passingOutYear: z.number().int().min(2000).max(2100).nullable().optional(),
	})
	.strict();
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

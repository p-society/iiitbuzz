import { z } from "zod";

export const googleCallbackQuerySchema = z.object({
	code: z.string().min(1, "Authorization code is required"),
	state: z.string().optional(),
	error: z.string().optional(),
	error_description: z.string().optional(),
});

export const googleTokenInfoSchema = z.object({
	email: z.string().email("Invalid email format"),
	email_verified: z.string().optional(),
	name: z.string().optional(),
	given_name: z.string().optional(),
	family_name: z.string().optional(),
	picture: z.string().url().optional(),
	sub: z.string(),
	aud: z.string(),
	iss: z.string(),
	exp: z.string(),
	iat: z.string(),
});

export const jwtPayloadSchema = z.object({
	userId: z.string().uuid("Invalid user ID format"),
	iat: z.number().optional(),
	exp: z.number().optional(),
});

export const createUserSchema = z.object({
	email: z.string().email("Invalid email format"),
	firstName: z.string().nullable().optional(),
	lastName: z.string().nullable().optional(),
	username: z.string().nullable().optional(),
	pronouns: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	branch: z.string().nullable().optional(),
	passingOutYear: z.number().int().min(2000).max(2030).nullable().optional(),
});

export const authSuccessResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	user: z
		.object({
			id: z.string().uuid(),
			email: z.string().email(),
			isNewUser: z.boolean(),
		})
		.optional(),
});

export const authErrorResponseSchema = z.object({
	error: z.string(),
	details: z.string().optional(),
});

export const logoutRequestSchema = z.object({
	allDevices: z.boolean().optional().default(false),
});

export type GoogleCallbackQuery = z.infer<typeof googleCallbackQuerySchema>;
export type GoogleTokenInfo = z.infer<typeof googleTokenInfoSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type AuthSuccessResponse = z.infer<typeof authSuccessResponseSchema>;
export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;

import { z } from "zod";

export const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters long"),
	GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
	GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
	GOOGLE_REDIRECT_URI: z
		.string()
		.url("GOOGLE_REDIRECT_URI must be a valid URL"),
	CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
	FRONTEND_URL: z
		.string()
		.url("FRONTEND_URL must be a valid URL")
		.default("http://localhost:5000"),
	PORT: z.coerce.number().int().default(3000),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);

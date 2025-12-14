import crypto from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { users } from "@/db/schema/user.schema";
import { DrizzleClient } from "../db/index";
import {
	createUserSchema,
	type GoogleTokenInfo,
	googleCallbackQuerySchema,
	googleTokenInfoSchema,
	type JwtPayload,
	jwtPayloadSchema,
} from "../dto/auth.dto";
import { env } from "../envSchema";
import type {
	AuthenticatedRequest,
	AuthenticationMiddleware,
} from "../types/auth.types";

export async function authRoutes(fastify: FastifyInstance) {
	fastify.get("/google/callback", async (request, reply) => {
		try {
			const queryValidation = googleCallbackQuerySchema.safeParse(
				request.query,
			);
			if (!queryValidation.success) {
				fastify.log.error(
					"Invalid callback query parameters:",
					queryValidation.error,
				);
				return reply.status(400).send({
					error: "Invalid callback parameters",
					details: queryValidation.error.issues[0]?.message,
				});
			}

			const { error, error_description } = queryValidation.data;

			if (error) {
				fastify.log.error("OAuth error:", { error, error_description });
				return reply.status(400).send({
					error: "OAuth authentication failed",
					details: error_description || error,
				});
			}

			const token =
				await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
					request,
				);
			const idToken = token.token.id_token;

			if (!idToken) {
				fastify.log.error("No ID token received from Google");
				return reply
					.status(400)
					.send({ error: "No ID token received from Google" });
			}

			const userInfoResponse = await fetch(
				`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
			);
			const userInfoData = await userInfoResponse.json();

			if (!userInfoResponse.ok) {
				fastify.log.error("Failed to fetch user info:", userInfoData);
				return reply
					.status(400)
					.send({ error: "Failed to fetch user info from Google" });
			}

			const userInfoValidation = googleTokenInfoSchema.safeParse(userInfoData);
			if (!userInfoValidation.success) {
				fastify.log.error(
					"Invalid user info from Google:",
					userInfoValidation.error,
				);
				return reply.status(400).send({
					error: "Invalid user information from Google",
					details: userInfoValidation.error.issues[0]?.message,
				});
			}

			const userInfo: GoogleTokenInfo = userInfoValidation.data;
			const { email } = userInfo;

			const createUserData = createUserSchema.parse({
				email,
				firstName: userInfo.given_name || null,
				lastName: userInfo.family_name || null,
			});

			let userId: string;
			let redirectPath: string;
			let isNewUser = false;

			// Atomic upsert operation to handle race conditions
			// This approach prevents race conditions where two concurrent requests
			// for the same new user could both try to insert, causing the second to fail
			// Strategy:
			// 1. Always attempt to INSERT a new user
			// 2. If email already exists (unique constraint), do nothing
			// 3. Check the result to determine if user was created or already existed
			const newUserResult = await DrizzleClient.insert(users)
				.values({
					id: crypto.randomUUID(),
					username: null,
					email: createUserData.email,
					firstName: createUserData.firstName,
					lastName: createUserData.lastName,
					pronouns: null,
					bio: null,
					branch: null,
					passingOutYear: null,
					totalPosts: 0,
				})
				.onConflictDoNothing({ target: users.email })
				.returning({ id: users.id });

			if (newUserResult.length > 0) {
				userId = newUserResult[0].id;
				redirectPath = `${env.FRONTEND_URL}/user-details`;
				isNewUser = true;
				fastify.log.info("New user created", { userId, email });
			} else {
				const existingUser = await DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.email, email),
				});

				if (!existingUser) {
					fastify.log.error("Failed to create or find user");
					return reply.status(500).send({ error: "Failed to process user" });
				}

				userId = existingUser.id;
				redirectPath = `${env.FRONTEND_URL}/home`;
				fastify.log.info("Existing user found", { userId, email });
			}

			const jwtPayload: JwtPayload = { userId };
			const jwtPayloadValidation = jwtPayloadSchema.safeParse(jwtPayload);

			if (!jwtPayloadValidation.success) {
				fastify.log.error("Invalid JWT payload:", jwtPayloadValidation.error);
				return reply
					.status(500)
					.send({ error: "Failed to create authentication token" });
			}

			const jwtToken = jwt.sign(jwtPayloadValidation.data, env.JWT_SECRET, {
				expiresIn: "7d",
			});

			reply.setCookie("auth_token", jwtToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: env.NODE_ENV === "production" ? "none" : "lax",
				maxAge: 60 * 60 * 24 * 7,
				path: "/",
			});

			fastify.log.info(`JWT cookie set. Redirecting to ${redirectPath}`, {
				userId,
				isNewUser,
			});

			return reply.redirect(redirectPath);
		} catch (err) {
			fastify.log.error("Error during Google OAuth:", err);
			return reply.status(500).send({
				error: "Something went wrong during Google login",
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	});

	// Logout route
	fastify.post("/logout", async (_request, reply) => {
		try {
			reply.clearCookie("auth_token", {
				path: "/",
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: env.NODE_ENV === "production" ? "none" : "lax",
			});

			fastify.log.info("User logged out");
			return reply.send({
				success: true,
				message: "Logged out successfully",
			});
		} catch (err) {
			fastify.log.error("Error during logout:", err);
			return reply.status(500).send({
				error: "Failed to logout",
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	});

	// Get current user route
	fastify.get(
		"/me",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			try {
				const authRequest = request as AuthenticatedRequest;
				const userId = authRequest.userId;

				const user = await DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, userId),
					columns: {
						id: true,
						email: true,
						username: true,
						firstName: true,
						lastName: true,
						pronouns: true,
						bio: true,
						branch: true,
						passingOutYear: true,
					},
				});

				if (!user) {
					return reply.status(404).send({ error: "User not found" });
				}

				return reply.send({ user });
			} catch (err) {
				fastify.log.error("Error fetching user info:", err);
				return reply.status(500).send({
					error: "Failed to fetch user information",
					details: err instanceof Error ? err.message : "Unknown error",
				});
			}
		},
	);
}

// Authentication middleware - required authentication
export const authenticateUser: AuthenticationMiddleware = async (
	request,
	reply,
) => {
	try {
		const token = request.cookies.auth_token;

		if (!token) {
			return reply
				.status(401)
				.send({ error: "No authentication token provided" });
		}

		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
		const jwtValidation = jwtPayloadSchema.safeParse(decoded);

		if (!jwtValidation.success) {
			request.log.error("Invalid JWT payload:", jwtValidation.error);
			return reply.status(401).send({ error: "Invalid authentication token" });
		}

		request.userId = jwtValidation.data.userId;
	} catch (err) {
		request.log.error("Authentication error:", err);
		return reply.status(401).send({ error: "Invalid authentication token" });
	}
};

// user authentication - added by sambhu ( to remove the code redundancy)
export const attachUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const authRequest = request as AuthenticatedRequest;
  const user = await DrizzleClient.query.users.findFirst({
	where: (u, { eq }) => eq(u.id, authRequest.userId),
  });
  if (!user) {
	return reply.status(404).send({ success: false, error: "User not found" });
  }
  authRequest.user = user;
};

// Optional authentication middleware - doesn't block request if no auth
export const optionalAuth: AuthenticationMiddleware = async (
	request,
	_reply,
) => {
	try {
		const token = request.cookies.auth_token;
		if (!token) return; // No token is fine for optional auth

		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
		const jwtValidation = jwtPayloadSchema.safeParse(decoded);

		if (jwtValidation.success) {
			request.userId = jwtValidation.data.userId;
		}
	} catch (err) {
		// Ignore auth errors for optional auth
		request.log.debug("Optional authentication failed:", err);
	}
};

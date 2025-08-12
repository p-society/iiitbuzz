import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { DrizzleClient } from "../db/index";
import { users } from "../db/schema/user.schema";
import type { AuthenticatedRequest } from "../types/auth.types";
import { authenticateUser, optionalAuth } from "./auth";

export async function userRoutes(fastify: FastifyInstance) {
	// Get user details by username - works for both authenticated and unauthenticated users
	fastify.get("/details/:username", { preHandler: optionalAuth }, async (request, reply) => {
		try {
			const { username } = request.params as { username: string };
			const authenticatedUserId = (request as AuthenticatedRequest).userId || null;

			// Fetch user details by username
			const user = await DrizzleClient.query.users.findFirst({
				where: (u, { eq }) => eq(u.username, username),
			});

			if (!user) {
				return reply.status(404).send({ 
					error: "User not found",
					success: false 
				});
			}

			// Check if it's own profile after fetching the user
			const isOwnProfile = authenticatedUserId === user.id;

			// Return different levels of detail based on whether it's own profile
			if (isOwnProfile) {
				// Full profile for own account
				return reply.send({
					success: true,
					isOwnProfile: true,
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
						firstName: user.firstName,
						lastName: user.lastName,
						pronouns: user.pronouns,
						bio: user.bio,
						branch: user.branch,
						passingOutYear: user.passingOutYear,
						totalPosts: user.totalPosts,
					},
				});
			} else {
				// Public profile for others
				return reply.send({
					success: true,
					isOwnProfile: false,
					user: {
						id: user.id,
						username: user.username,
						firstName: user.firstName,
						lastName: user.lastName,
						pronouns: user.pronouns,
						bio: user.bio,
						branch: user.branch,
						passingOutYear: user.passingOutYear,
						totalPosts: user.totalPosts,
						// Note: email is not exposed for other users
					},
				});
			}
		} catch (err) {
			fastify.log.error("Error fetching user details:", err);
			return reply.status(500).send({
				error: "Failed to fetch user details",
				success: false,
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	});

	// Get current authenticated user's profile
	fastify.get("/me", { preHandler: authenticateUser }, async (request, reply) => {
		try {
			const userId = (request as AuthenticatedRequest).userId;

			const user = await DrizzleClient.query.users.findFirst({
				where: (u, { eq }) => eq(u.id, userId),
			});

			if (!user) {
				return reply.status(404).send({ 
					error: "User not found",
					success: false 
				});
			}

			return reply.send({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
					pronouns: user.pronouns,
					bio: user.bio,
					branch: user.branch,
					passingOutYear: user.passingOutYear,
					totalPosts: user.totalPosts,
				},
			});
		} catch (err) {
			fastify.log.error("Error fetching current user:", err);
			return reply.status(500).send({
				error: "Failed to fetch user information",
				success: false,
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	});

	// Update current user's profile (protected route)
	fastify.patch("/me", { preHandler: authenticateUser }, async (request, reply) => {
		try {
			const userId = (request as AuthenticatedRequest).userId;
			const updateData = request.body as Partial<{
				username: string;
				firstName: string;
				lastName: string;
				pronouns: string;
				bio: string;
				branch: string;
				passingOutYear: number;
			}>;

			// Remove any fields that shouldn't be updated via this endpoint
			const allowedFields = ['username', 'firstName', 'lastName', 'pronouns', 'bio', 'branch', 'passingOutYear'];
			const filteredData = Object.fromEntries(
				Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
			);

			if (Object.keys(filteredData).length === 0) {
				return reply.status(400).send({
					error: "No valid fields provided for update",
					success: false,
				});
			}

			const updatedUser = await DrizzleClient.update(users)
				.set(filteredData)
				.where(eq(users.id, userId))
				.returning();

			if (updatedUser.length === 0) {
				return reply.status(404).send({
					error: "User not found",
					success: false,
				});
			}

			return reply.send({
				success: true,
				message: "Profile updated successfully",
				user: {
					id: updatedUser[0].id,
					email: updatedUser[0].email,
					username: updatedUser[0].username,
					firstName: updatedUser[0].firstName,
					lastName: updatedUser[0].lastName,
					pronouns: updatedUser[0].pronouns,
					bio: updatedUser[0].bio,
					branch: updatedUser[0].branch,
					passingOutYear: updatedUser[0].passingOutYear,
					totalPosts: updatedUser[0].totalPosts,
				},
			});
		} catch (err) {
			fastify.log.error("Error updating user profile:", err);
			return reply.status(500).send({
				error: "Failed to update user profile",
				success: false,
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	});
}

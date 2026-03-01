import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { users } from "@/db/schema/user.schema";
import { DrizzleClient } from "../db/index";
import {
	type User,
	userDetailsParamsSchema,
	userUpdateSchema,
} from "../dto/user.dto";
import { authenticateUser, optionalAuth } from "./auth";

export async function userRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/details/:username",
		{ preHandler: optionalAuth },
		async (request, reply) => {
			try {
				const { username } = userDetailsParamsSchema.parse(request.params);
				const authenticatedUserId = request.userId ?? null;

				const user = await DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.username, username),
				});

				if (!user) {
					return reply.status(404).send({
						error: "User not found",
						success: false,
					});
				}

				const isOwnProfile = authenticatedUserId === user.id;

				const formatUserForResponse = (user: User, isOwner: boolean) => {
					const publicProfile = {
						id: user.id,
						username: user.username,
						firstName: user.firstName,
						lastName: user.lastName,
						imageUrl : user.imageUrl,
						pronouns: user.pronouns,
						bio: user.bio,
						branch: user.branch,
						passingOutYear: user.passingOutYear,
						totalPosts: user.totalPosts,
					};

					if (isOwner) {
						return { ...publicProfile, email: user.email };
					}

					return publicProfile;
				};

				const responseUser = formatUserForResponse(user, isOwnProfile);
				return reply.send({
					success: true,
					isOwnProfile,
					user: responseUser,
				});
			} catch (err) {
				fastify.log.error("Error fetching user details:", err);
				return reply.status(500).send({
					error: "Failed to fetch user details",
					success: false,
					details: err instanceof Error ? err.message : "Unknown error",
				});
			}
		},
	);

	
	fastify.get(
		"/me",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			try {
				const userId = request.userId;
				if (!userId) {
					return reply
						.status(401)
						.send({ error: "Unauthorized", success: false });
				}

				const user = await DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, userId),
				});

				if (!user) {
					return reply.status(404).send({
						error: "User not found",
						success: false,
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
						imageUrl : user.imageUrl,
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
		},
	);

	
	fastify.patch(
		"/me",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			try {
				const userId = request.userId;
				if (!userId) {
					return reply
						.status(401)
						.send({ error: "Unauthorized", success: false });
				}
				const updateData = userUpdateSchema.parse(request.body);

				
				const filteredData = Object.fromEntries(
					Object.entries(updateData).filter(([, v]) => v !== undefined),
				) as Partial<typeof users.$inferInsert>;

				if (Object.keys(filteredData).length === 0) {
					return reply.status(400).send({
						error: "No valid fields provided for update",
						success: false,
					});
				}

				let updatedUser: Array<typeof users.$inferSelect>;
				try {
					updatedUser = await DrizzleClient.update(users)
						.set(filteredData)
						.where(eq(users.id, userId))
						.returning();
				} catch (e) {
					if (e instanceof Error && /unique|duplicate/i.test(e.message)) {
						return reply.status(409).send({
							error: "Username already taken",
							success: false,
						});
					}
					throw e;
				}

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
		},
	);

	fastify.delete(
		"/me",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authenticateduserId = request.userId;

			if (!authenticateduserId) {
				return reply
					.status(401)
					.send({ error: "Unauthorized", success: false });
			}

			const user = await DrizzleClient.query.users.findFirst({
				where: (u, { eq }) => eq(u.id, authenticateduserId),
			});

			if (!user) {
				return reply
					.status(404)
					.send({ error: "User not found", success: false });
			}
			try {
				const deletedUser = await DrizzleClient.delete(users).where(
					eq(users.id, authenticateduserId),
				);
				if (!deletedUser) {
					return reply
						.status(404)
						.send({ error: "User not found", success: false });
				}
				return reply.send({
					success: true,
					message: "User deleted successfully",
				});
			} catch (err) {
				fastify.log.error("Error deleting user:", err);
				return reply.status(500).send({
					error: "Failed to delete user",
					success: false,
					details: err instanceof Error ? err.message : "Unknown error",
				});
			}
		},
	);
}

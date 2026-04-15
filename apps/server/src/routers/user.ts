import { and, asc, desc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { users } from "@/db/schema/user.schema";
import { bookmarks } from "@/db/schema/bookmark.schema";
import { threads } from "@/db/schema/thread.schema";
import { posts } from "@/db/schema/post.schema";
import { votes } from "@/db/schema/vote.schema";
import { topics } from "@/db/schema/topic.schema";
import { DrizzleClient } from "../db/index";
import {
	type User,
	userDetailsParamsSchema,
	userUpdateSchema,
} from "../dto/user.dto";
import { authenticateUser, optionalAuth } from "./auth";

export async function userRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/search",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const querySchema = z.object({
				q: z.string().max(32).optional().default(""),
				limit: z.coerce.number().int().min(1).max(10).optional().default(5),
			});

			try {
				const { q, limit } = querySchema.parse(request.query);
				const searchTerm = q.trim();
				const matchedUsers = await DrizzleClient.select({
					id: users.id,
					username: users.username,
					imageUrl: users.imageUrl,
				})
					.from(users)
					.where(
						searchTerm
							? and(
									isNotNull(users.username),
									ilike(users.username, `${searchTerm}%`),
								)
							: isNotNull(users.username),
					)
					.orderBy(asc(users.username))
					.limit(limit);

				return reply.send({
					success: true,
					users: matchedUsers.filter(
						(user): user is typeof matchedUsers[number] & { username: string } =>
							Boolean(user.username),
					),
				});
			} catch (err) {
				fastify.log.error("Error searching users:", err);
				return reply.status(500).send({
					error: "Failed to search users",
					success: false,
				});
			}
		},
	);

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
						imageUrl: user.imageUrl,
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
						imageUrl: user.imageUrl,
						pronouns: user.pronouns,
						bio: user.bio,
						branch: user.branch,
						passingOutYear: user.passingOutYear,
						totalPosts: user.totalPosts,
						role: user.role,
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

	fastify.get(
		"/:userId/bookmarks",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			try {
				const authUserId = request.userId;
				const { userId } = request.params as { userId: string };
				if (!authUserId) {
					return reply
						.status(401)
						.send({ error: "Unauthorized", success: false });
				}
				if (authUserId !== userId) {
					return reply
						.status(403)
						.send({ error: "Forbidden", success: false });
				}

				const bookmarkedThreads = await DrizzleClient.select({
					id: threads.id,
					threadTitle: threads.threadTitle,
					topicName: topics.topicName,
					topicId: threads.topicId,
					authorName: sql<string>`
						CASE
							WHEN ${threads.isAnonymous} = true THEN 'Anonymous'
							WHEN ${users.username} IS NOT NULL THEN ${users.username}
							ELSE ${users.firstName}
						END
					`.as("authorName"),
					replies: sql<number>`GREATEST(COUNT(${posts.id}) - 1, 0)`.as(
						"replies",
					),
					viewCount: threads.viewCount,
					createdAt:
						sql<string>`COALESCE(MAX(${posts.createdAt}), ${threads.createdAt})`.as(
							"createdAt",
						),
				})
					.from(bookmarks)
					.innerJoin(threads, eq(bookmarks.threadId, threads.id))
					.leftJoin(users, eq(threads.createdBy, users.id))
					.leftJoin(
						posts,
						and(
							eq(posts.threadId, threads.id),
							eq(posts.isDraft, false),
							isNull(posts.deletedAt),
						),
					)
					.leftJoin(topics, eq(threads.topicId, topics.id))
					.where(
						and(eq(bookmarks.userId, userId), isNull(threads.deletedAt)),
					)
					.groupBy(
						threads.id,
						threads.threadTitle,
						threads.topicId,
						threads.viewCount,
						threads.createdAt,
						threads.isAnonymous,
						users.username,
						users.firstName,
						topics.topicName,
						bookmarks.createdAt,
					)
					.orderBy(desc(bookmarks.createdAt))
					.limit(20);

				return reply.send({
					success: true,
					threads: bookmarkedThreads,
				});
			} catch (err) {
				fastify.log.error("Error fetching bookmarked threads:", err);
				return reply.status(500).send({
					error: "Failed to fetch bookmarked threads",
					success: false,
				});
			}
		},
	);

	fastify.get(
		"/:userId/activity",
		{ preHandler: optionalAuth },
		async (request, reply) => {
			try {
				const { userId } = request.params as { userId: string };

				const userThreads = await DrizzleClient.select({
					id: threads.id,
					type: sql<string>`'thread'`,
					title: threads.threadTitle,
					createdAt: threads.createdAt,
				})
					.from(threads)
					.where(and(eq(threads.createdBy, userId), isNull(threads.deletedAt)))
					.orderBy(desc(threads.createdAt))
					.limit(5);

				const userPosts = await DrizzleClient.select({
					id: posts.id,
					type: sql<string>`'post'`,
					title: threads.threadTitle,
					content: posts.content,
					threadId: posts.threadId,
					createdAt: posts.createdAt,
				})
					.from(posts)
					.innerJoin(threads, eq(posts.threadId, threads.id))
					.where(
						and(
							eq(posts.createdBy, userId),
							isNull(posts.deletedAt),
							isNull(threads.deletedAt),
						),
					)
					.orderBy(desc(posts.createdAt))
					.limit(5);

				const userLikes = await DrizzleClient.select({
					id: votes.id,
					type: sql<string>`'like'`,
					title: threads.threadTitle,
					threadId: threads.id,
					createdAt: votes.createdAt,
				})
					.from(votes)
					.innerJoin(posts, eq(votes.postId, posts.id))
					.innerJoin(threads, eq(posts.threadId, threads.id))
					.where(
						and(
							eq(votes.userId, userId),
							isNull(posts.deletedAt),
							isNull(threads.deletedAt),
						),
					)
					.orderBy(desc(votes.createdAt))
					.limit(5);

				const activity = [...userThreads, ...userPosts, ...userLikes].sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);

				return reply.send({
					success: true,
					activity: activity.slice(0, 15),
				});
			} catch (err) {
				fastify.log.error("Error fetching user activity:", err);
				return reply.status(500).send({
					error: "Failed to fetch user activity",
					success: false,
				});
			}
		},
	);
}

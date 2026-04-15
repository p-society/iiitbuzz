import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { DrizzleClient } from "@/db/index";
import { posts as postsTable } from "@/db/schema/post.schema";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { users as usersTable } from "@/db/schema/user.schema";
import { notifications as notifTable } from "@/db/schema/notification.schema";
import {
	createPostSchema,
	postIdParamsSchema,
	updatePostSchema,
	createDraftSchema,
	publishDraftSchema,
} from "@/dto/posts.dto";
import { threadIdParamsSchema } from "@/dto/threads.dto";
import { createMentionNotifications } from "@/utils/mentions";
import { attachUser, authenticateUser } from "./auth";

export async function postRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/threads/:id/posts",
		{
			preHandler: [authenticateUser, attachUser],
			schema: {
				querystring: {
					type: "object",
					properties: {
						page: { type: "integer", minimum: 1, default: 1 },
						limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
					},
				},
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Querystring: { page: number; limit: number };
			}>,
			reply,
		) => {
			const { page, limit } = request.query;
			const offset = (page - 1) * limit;
			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread ID" });
			const threadId = params.data.id;
			try {
				const thread = await DrizzleClient.query.threads.findFirst({
					where: (t, { eq, isNull, and }) =>
						and(eq(t.id, threadId), isNull(t.deletedAt)),
					columns: { id: true },
				});

				if (!thread) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				const postsQuery = DrizzleClient.select({
					postId: postsTable.id,
					content: postsTable.content,
					createdAt: postsTable.createdAt,
					likes: postsTable.vote,

					authorId: usersTable.id,
					authorName: sql<string>`
                CASE 
                    WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username} 
                    ELSE ${usersTable.firstName} 
                END
            `.as("authorName"),
				})
					.from(postsTable)
					.leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(postsTable.threadId, threadId),
							ne(postsTable.isDraft, true),
							isNull(postsTable.deletedAt),
						),
					)
					.orderBy(postsTable.createdAt)
					.limit(limit)
					.offset(offset);

				const countQuery = DrizzleClient.select({ total: count() })
					.from(postsTable)
					.where(
						and(
							eq(postsTable.threadId, threadId),
							ne(postsTable.isDraft, true),
							isNull(postsTable.deletedAt),
						),
					);

				const [threadPosts, countResult] = await Promise.all([
					postsQuery,
					countQuery,
				]);

				return reply.status(200).send({
					success: true,
					posts: threadPosts,
					pagination: {
						page,
						limit,
						count: countResult[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error("Error fetching posts for thread:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch posts" });
			}
		},
	);

	fastify.get(
		"/posts/:id",
		{ preHandler: [authenticateUser, attachUser] },
		async (request, reply) => {
			const params = postIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply
					.status(400)
					.send({ success: false, error: "Invalid post id" });
			}
			try {
				const post = await DrizzleClient.query.posts.findFirst({
					where: (p, { eq, isNull, and }) =>
						and(eq(p.id, params.data.id), isNull(p.deletedAt)),
				});
				if (!post) {
					return reply
						.status(404)
						.send({ success: false, error: "Post not found" });
				}
				return reply.status(200).send({ success: true, post });
			} catch (error) {
				fastify.log.error("Error fetching post:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch post" });
			}
		},
	);

	// Create post
	fastify.post(
		"/posts",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			const body = createPostSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid request body" });

			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq, isNull, and }) =>
					and(eq(t.id, body.data.threadId), isNull(t.deletedAt)),
			});
			if (!thread)
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });

			const toInsert: typeof postsTable.$inferInsert = {
				threadId: body.data.threadId,
				content: body.data.content,
				createdBy: authUserId,
			};

			const post = await DrizzleClient.transaction(async (tx) => {
				const [newPost] = await tx
					.insert(postsTable)
					.values(toInsert)
					.returning();
				await tx
					.update(usersTable)
					.set({
						totalPosts: sql`${usersTable.totalPosts} + 1`,
					})
					.where(eq(usersTable.id, authUserId));
				return newPost;
			});

			// Create notification for thread author (if not replying to own thread)
			if (thread.createdBy !== authUserId) {
				try {
					await DrizzleClient.insert(notifTable).values({
						userId: thread.createdBy,
						type: "reply",
						threadId: body.data.threadId,
						fromUserId: authUserId,
						message: "replied to your thread",
					});
				} catch (notifError) {
					fastify.log.error("Error creating notification:", notifError);
				}
			}

			try {
				await createMentionNotifications({
					content: body.data.content,
					fromUserId: authUserId,
					threadId: body.data.threadId,
				});
			} catch (notifError) {
				fastify.log.error("Error creating mention notifications:", notifError);
			}

			return reply.status(201).send({ success: true, post });
		},
	);

	// Update post
	fastify.patch(
		"/posts/:id",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			const params = postIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid post id" });
			const body = updatePostSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid request body" });

			const post = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq, isNull, and }) =>
					and(eq(p.id, params.data.id), isNull(p.deletedAt)),
			});
			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Post not found" });
			if (post.createdBy !== authUserId)
				return reply.status(403).send({ success: false, error: "Forbidden" });

			const updates: Partial<typeof postsTable.$inferInsert> = {
				content: body.data.content ?? undefined,
				updatedBy: authUserId,
				updatedAt: new Date().toISOString(),
			};
			const [updated] = await DrizzleClient.update(postsTable)
				.set(updates)
				.where(eq(postsTable.id, params.data.id))
				.returning();
			return reply.status(200).send({ success: true, post: updated });
		},
	);

	// Delete post
	fastify.delete(
		"/posts/:id",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			const params = postIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid post id" });
			const [authUser, post] = await Promise.all([
				DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, authUserId),
					columns: { id: true, role: true },
				}),
				DrizzleClient.query.posts.findFirst({
					where: (p, { eq, isNull, and }) =>
						and(eq(p.id, params.data.id), isNull(p.deletedAt)),
				}),
			]);
			if (!authUser)
				return reply
					.status(404)
					.send({ success: false, error: "User not found" });
			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Post not found" });
			if (post.createdBy !== authUserId && authUser.role !== "admin")
				return reply.status(403).send({ success: false, error: "Forbidden" });

			await DrizzleClient.update(postsTable)
				.set({
					deletedAt: new Date().toISOString(),
					deletedBy: authUserId,
					updatedAt: new Date().toISOString(),
					updatedBy: authUserId,
				})
				.where(eq(postsTable.id, params.data.id));

			if (!post.isDraft) {
				await DrizzleClient.update(usersTable)
					.set({
						totalPosts: sql`GREATEST(${usersTable.totalPosts} - 1, 0)`,
					})
					.where(eq(usersTable.id, post.createdBy));
			}
			return reply.status(204).send();
		},
	);

	// Create draft post
	fastify.post(
		"/posts/draft",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			const body = createDraftSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid request body" });

			const { threadId } = body.data;

			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq, isNull, and }) =>
					and(eq(t.id, threadId), isNull(t.deletedAt)),
			});
			if (!thread)
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });

			const existingDraft = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq, and, isNull }) =>
					and(
						eq(p.threadId, threadId),
						eq(p.createdBy, authUserId),
						eq(p.isDraft, true),
						isNull(p.deletedAt),
					),
			});

			if (existingDraft) {
				return reply.status(200).send({ success: true, post: existingDraft });
			}

			const [newPost] = await DrizzleClient.insert(postsTable)
				.values({
					threadId,
					content: "",
					createdBy: authUserId,
					isDraft: true,
					isApproved: true,
				})
				.returning();

			return reply.status(201).send({ success: true, post: newPost });
		},
	);

	// Publish draft post
	fastify.patch(
		"/posts/:id/publish",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			const params = postIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid post id" });

			const body = publishDraftSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid request body" });

			const post = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq, isNull, and }) =>
					and(eq(p.id, params.data.id), isNull(p.deletedAt)),
			});

			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Post not found" });
			if (post.createdBy !== authUserId)
				return reply.status(403).send({ success: false, error: "Forbidden" });
			if (!post.isDraft)
				return reply
					.status(400)
					.send({ success: false, error: "Post is not a draft" });

			const [updated] = await DrizzleClient.update(postsTable)
				.set({
					content: body.data.content,
					isDraft: false,
					isApproved: true,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(postsTable.id, params.data.id))
				.returning();

			await DrizzleClient.update(usersTable)
				.set({
					totalPosts: sql`${usersTable.totalPosts} + 1`,
				})
				.where(eq(usersTable.id, authUserId));

			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq, isNull, and }) =>
					and(eq(t.id, updated.threadId), isNull(t.deletedAt)),
			});

			if (thread && thread.createdBy !== authUserId) {
				try {
					await DrizzleClient.insert(notifTable).values({
						userId: thread.createdBy,
						type: "reply",
						threadId: updated.threadId,
						fromUserId: authUserId,
						message: "replied to your thread",
					});
				} catch (notifError) {
					fastify.log.error("Error creating notification:", notifError);
				}
			}

			try {
				await createMentionNotifications({
					content: body.data.content,
					fromUserId: authUserId,
					threadId: updated.threadId,
				});
			} catch (notifError) {
				fastify.log.error("Error creating mention notifications:", notifError);
			}

			return reply.status(200).send({ success: true, post: updated });
		},
	);
}

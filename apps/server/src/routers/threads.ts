import { and, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
	createThreadSchema,
	threadIdParamsSchema,
	updateThreadSchema,
} from "@/dto/threads.dto";
import { topicIdParamsSchema } from "@/dto/topics.dto";
import { DrizzleClient } from "../db/index";
import { posts as postsTable } from "../db/schema/post.schema";
import { bookmarks as bookmarksTable } from "../db/schema/bookmark.schema";
import { threads as threadsTable } from "../db/schema/thread.schema";
import { topics as topicsTable } from "../db/schema/topic.schema";
import { users as usersTable } from "../db/schema/user.schema";
import { attachUser, authenticateUser, optionalAuth } from "./auth";

export async function threadRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/threads/:id/bookmark",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId) {
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			}

			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread ID" });
			}

			const [existing] = await DrizzleClient.select({ id: bookmarksTable.id })
				.from(bookmarksTable)
				.where(
					and(
						eq(bookmarksTable.threadId, params.data.id),
						eq(bookmarksTable.userId, authUserId),
					),
				)
				.limit(1);

			return reply.send({
				success: true,
				isBookmarked: Boolean(existing),
			});
		},
	);

	fastify.put(
		"/threads/:id/bookmark",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId) {
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			}

			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread ID" });
			}

			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq, and, isNull }) =>
					and(eq(t.id, params.data.id), isNull(t.deletedAt)),
				columns: { id: true },
			});
			if (!thread) {
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });
			}

			await DrizzleClient.insert(bookmarksTable)
				.values({
					threadId: params.data.id,
					userId: authUserId,
				})
				.onConflictDoNothing({
					target: [bookmarksTable.userId, bookmarksTable.threadId],
				});

			return reply.send({ success: true, isBookmarked: true });
		},
	);

	fastify.delete(
		"/threads/:id/bookmark",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId) {
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			}

			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread ID" });
			}

			await DrizzleClient.delete(bookmarksTable).where(
				and(
					eq(bookmarksTable.threadId, params.data.id),
					eq(bookmarksTable.userId, authUserId),
				),
			);

			return reply.send({ success: true, isBookmarked: false });
		},
	);

	fastify.get(
		"/threads",
		{
			preHandler: optionalAuth,
			schema: {
				querystring: {
					type: "object",
					properties: {
						page: { type: "integer", minimum: 1, default: 1 },
						limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
						sort: {
							type: "string",
							enum: ["latest", "top", "trending", "views"],
							default: "latest",
						},
						search: { type: "string" },
					},
				},
			},
		},
		async (request, reply) => {
			const { page, limit, sort, search } = request.query as {
				page: number;
				limit: number;
				sort: "latest" | "top" | "trending" | "views";
				search?: string;
			};
			const offset = (page - 1) * limit;

			try {
				let orderBy;
				switch (sort) {
					case "top":
						orderBy = desc(sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`);
						break;
					case "views":
						orderBy = desc(threadsTable.viewCount);
						break;
					case "trending":
						orderBy = desc(sql<number>`
                        (${threadsTable.viewCount} * 0.5) + 
                        (COALESCE(COUNT(${postsTable.id}), 0) * 2)
                    `);
						break;
					case "latest":
					default:
						orderBy = desc(
							sql`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`,
						);
						break;
				}

				const selectQuery = DrizzleClient.select({
					id: threadsTable.id,
					title: threadsTable.threadTitle,
					createdAt: threadsTable.createdAt,
					topicId: threadsTable.topicId,
					views: threadsTable.viewCount,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,

					authorName: sql<string>`
                    CASE
                        WHEN ${threadsTable.isAnonymous} = true THEN 'Anonymous'
                        WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username}
                        ELSE ${usersTable.firstName}
                    END
                `.as("authorName"),

					replies: sql<number>`GREATEST(COUNT(${postsTable.id}) - 1, 0)`.as(
						"replies",
					),
					lastActive:
						sql<string>`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`.as(
							"lastActive",
						),
					likes: sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`.as("likes"),
					topicName: topicsTable.topicName,
					isPinned: sql<boolean>`(${threadsTable.pinnedAt} IS NOT NULL)`.as(
						"isPinned",
					),
				})
					.from(threadsTable)
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.leftJoin(
						postsTable,
						and(
							eq(postsTable.threadId, threadsTable.id),
							eq(postsTable.isDraft, false),
							isNull(postsTable.deletedAt),
						),
					)
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id));

				const withSearch =
					search && search.trim()
						? selectQuery.where(
								and(
									isNull(threadsTable.deletedAt),
									ilike(
										threadsTable.threadTitle,
										sql`${"%" + search.trim() + "%"}`,
									),
									sql`(${threadsTable.isAnonymous} = false OR ${threadsTable.isApproved} = true)`,
								),
							)
						: selectQuery.where(
								and(
									isNull(threadsTable.deletedAt),
									sql`(${threadsTable.isAnonymous} = false OR ${threadsTable.isApproved} = true)`,
								),
							);

				const threadsQuery = withSearch
					.groupBy(
						threadsTable.id,
						threadsTable.threadTitle,
						threadsTable.createdAt,
						threadsTable.topicId,
						threadsTable.viewCount,
						threadsTable.isAnonymous,
						threadsTable.isApproved,
						usersTable.username,
						usersTable.firstName,
						topicsTable.topicName,
					)
					.orderBy(orderBy)
					.limit(limit)
					.offset(offset);

				const approvalFilter = and(
					isNull(threadsTable.deletedAt),
					sql`(${threadsTable.isAnonymous} = false OR ${threadsTable.isApproved} = true)`,
				);

				const countBase = DrizzleClient.select({ total: count() })
					.from(threadsTable)
					.where(approvalFilter);
				const countQuery =
					search && search.trim()
						? DrizzleClient.select({ total: count() })
								.from(threadsTable)
								.where(
									and(
										ilike(
											threadsTable.threadTitle,
											sql`${"%" + search.trim() + "%"}`,
										),
										approvalFilter,
									),
								)
						: countBase;

				const [threads, countResult] = await Promise.all([
					threadsQuery,
					countQuery,
				]);

				return reply.status(200).send({
					success: true,
					threads: threads,
					pagination: {
						page,
						limit,
						count: countResult[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error("Error fetching all threads:", error);
				return reply.status(500).send({
					success: false,
					error: "Failed to fetch threads due to internal database error.",
				});
			}
		},
	);

	fastify.get(
		"/topics/:id/threads",
		{
			preHandler: [authenticateUser, attachUser],
			schema: {
				querystring: {
					type: "object",
					properties: {
						page: { type: "integer", minimum: 1, default: 1 },
						limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
						sort: {
							type: "string",
							enum: ["latest", "top", "trending", "views"],
							default: "latest",
						},
					},
				},
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Querystring: {
					page: number;
					limit: number;
					sort?: "latest" | "top" | "trending" | "views";
				};
			}>,
			reply,
		) => {
			const { page, limit, sort = "latest" } = request.query;
			const offset = (page - 1) * limit;
			const params = topicIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid topic ID" });
			const topicId = params.data.id;
			try {
				let orderBy;
				switch (sort) {
					case "top":
						// Order by sum of votes across all posts
						orderBy = desc(sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`);
						break;
					case "views":
						orderBy = desc(threadsTable.viewCount);
						break;
					case "trending":
						// Order by trending score: viewCount + postCount
						orderBy = desc(sql<number>`
              (${threadsTable.viewCount} * 0.5) + 
              (COALESCE(COUNT(${postsTable.id}), 0) * 2)
            `);
						break;
					case "latest":
					default:
						// Order by last active time (max post creation time)
						orderBy = desc(
							sql`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`,
						);
						break;
				}

				const threadsQuery = DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					createdAt: threadsTable.createdAt,
					topicId: threadsTable.topicId,
					viewCount: threadsTable.viewCount,
					createdBy: threadsTable.createdBy,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,

					authorName: sql<string>`
            CASE
              WHEN ${threadsTable.isAnonymous} = true THEN 'Anonymous'
              WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username}
              ELSE ${usersTable.firstName}
            END
          `.as("authorName"),

					replies: sql<number>`GREATEST(COUNT(${postsTable.id}) - 1, 0)`.as(
						"replies",
					),
					lastActive:
						sql<string>`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`.as(
							"lastActive",
						),
					likes: sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`.as("likes"),
					isPinned: sql<boolean>`(${threadsTable.pinnedAt} IS NOT NULL)`.as(
						"isPinned",
					),
				})
					.from(threadsTable)
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.leftJoin(
						postsTable,
						and(
							eq(postsTable.threadId, threadsTable.id),
							eq(postsTable.isDraft, false),
							isNull(postsTable.deletedAt),
						),
					)
					.where(
						and(
							eq(threadsTable.topicId, topicId),
							isNull(threadsTable.deletedAt),
							sql`(${threadsTable.isAnonymous} = false OR ${threadsTable.isApproved} = true)`,
						),
					)
					.groupBy(
						threadsTable.id,
						threadsTable.threadTitle,
						threadsTable.createdAt,
						threadsTable.topicId,
						threadsTable.viewCount,
						threadsTable.createdBy,
						threadsTable.isAnonymous,
						threadsTable.isApproved,
						usersTable.username,
						usersTable.firstName,
					)
					.orderBy(orderBy)
					.limit(limit)
					.offset(offset);

				const [relatedThreads, countResult] = await Promise.all([
					threadsQuery,
					DrizzleClient.select({ total: count() })
						.from(threadsTable)
						.where(
							and(
								eq(threadsTable.topicId, topicId),
								isNull(threadsTable.deletedAt),
								sql`(${threadsTable.isAnonymous} = false OR ${threadsTable.isApproved} = true)`,
							),
						),
				]);

				const threadsWithStats = relatedThreads.map((thread) => ({
					id: thread.id,
					threadTitle: thread.threadTitle,
					title: thread.threadTitle,
					createdAt: thread.createdAt,
					topicId: thread.topicId,
					viewCount: thread.viewCount ?? 0,
					authorName: thread.authorName || "Anonymous",
					replies: Math.max(0, thread.replies ?? 0),
					replyCount: Math.max(0, thread.replies ?? 0),
					views: thread.viewCount ?? 0,
					lastActive: thread.lastActive || thread.createdAt,
					likes: thread.likes ?? 0,
					isPinned: thread.isPinned ?? false,
					isAnonymous: thread.isAnonymous,
					isApproved: thread.isApproved,
				}));

				return reply.status(200).send({
					success: true,
					threads: threadsWithStats,
					pagination: {
						page,
						limit,
						count: countResult[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error("Error fetching threads for topic:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch threads" });
			}
		},
	);

	fastify.get(
		"/threads/:id",
		{ preHandler: [authenticateUser, attachUser] },
		async (request, reply) => {
			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread id" });
			}

			try {
				const threadData = await DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					topicId: threadsTable.topicId,
					createdAt: threadsTable.createdAt,
					createdBy: threadsTable.createdBy,
					viewCount: threadsTable.viewCount,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,
					topicName: topicsTable.topicName,
					authorName: sql<string>`
          CASE
            WHEN ${threadsTable.isAnonymous} = true THEN 'Anonymous'
            WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username}
            ELSE ${usersTable.firstName}
          END
        `.as("authorName"),
				})
					.from(threadsTable)
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
					.where(
						and(eq(threadsTable.id, params.data.id), isNull(threadsTable.deletedAt)),
					)
					.limit(1);

				const thread = threadData[0];

				if (!thread) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				if (thread.isAnonymous && !thread.isApproved) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				await DrizzleClient.update(threadsTable)
					.set({
						viewCount: sql`${threadsTable.viewCount} + 1`,
					})
					.where(eq(threadsTable.id, params.data.id));

				return reply.status(200).send({ success: true, thread });
			} catch (error) {
				fastify.log.error("Error fetching thread:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch thread" });
			}
		},
	);

	fastify.get(
		"/users/:userId/threads",
		{
			preHandler: optionalAuth,
			schema: {
				params: {
					type: "object",
					properties: { userId: { type: "string", format: "uuid" } },
					required: ["userId"],
				},
				querystring: {
					type: "object",
					properties: {
						page: { type: "integer", minimum: 1, default: 1 },
						limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
					},
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.params as { userId: string };
			const { page, limit } = request.query as { page: number; limit: number };
			const offset = (page - 1) * limit;
			try {
				const userThreadsQuery = DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					createdAt: threadsTable.createdAt,
					viewCount: threadsTable.viewCount,
					topicName: topicsTable.topicName,
					topicId: topicsTable.id,
					replies:
						sql<number>`GREATEST(CAST(COUNT(${postsTable.id}) - 1 AS INTEGER), 0)`.as(
							"replies",
						),
					likes: sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`.as("likes"),
				})
					.from(threadsTable)
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
					.leftJoin(
						postsTable,
						and(
							eq(postsTable.threadId, threadsTable.id),
							eq(postsTable.isDraft, false),
							isNull(postsTable.deletedAt),
						),
					)
					.where(
						and(eq(threadsTable.createdBy, userId), isNull(threadsTable.deletedAt)),
					)
					.groupBy(
						threadsTable.id,
						threadsTable.threadTitle,
						threadsTable.createdAt,
						threadsTable.viewCount,
						topicsTable.topicName,
						topicsTable.id,
					)
					.orderBy(desc(threadsTable.createdAt))
					.limit(limit)
					.offset(offset);
				const countQuery = DrizzleClient.select({ total: count() })
					.from(threadsTable)
					.where(
						and(eq(threadsTable.createdBy, userId), isNull(threadsTable.deletedAt)),
					);
				const [threads, totalCount] = await Promise.all([
					userThreadsQuery,
					countQuery,
				]);
				return reply.send({
					success: true,
					threads,
					pagination: {
						page,
						limit,
						total: totalCount[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error(error);
				return reply
					.status(500)
					.send({ success: false, error: "Internal Server Error" });
			}
		},
	);

	fastify.post(
		"/threads/new",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const userid = request.userId;
			if (!userid) {
				return reply
					.status(401)
					.send({ error: "Unauthorized", success: false });
			}
			const user = await DrizzleClient.query.users.findFirst({
				where: (u, { eq }) => eq(u.id, userid),
			});
			if (!user) {
				return reply
					.status(404)
					.send({ error: "User not found", success: false });
			}
			const parsed = createThreadSchema.safeParse(request.body);
			if (!parsed.success) {
				return reply
					.status(400)
					.send({ error: "Invalid request body", success: false });
			}

			const data = parsed.data;

			type NewThread = typeof threadsTable.$inferInsert;
			const toInsert: NewThread = {
				topicId: data.topicId,
				threadTitle: data.threadTitle,
				createdBy: userid,
				viewCount: 0,
				isAnonymous: data.isAnonymous ?? false,
				isApproved: !(data.isAnonymous ?? false),
			};
			try {
				const [newThread] = await DrizzleClient.insert(threadsTable)
					.values(toInsert)
					.returning();
				return reply.status(201).send({ success: true, thread: newThread });
			} catch (error) {
				fastify.log.error({ err: error, toInsert }, "Error creating thread");
				return reply.status(500).send({
					error: "Failed to create thread",
					success: false,
					details: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	);

	fastify.patch(
		"/threads/:id",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread id" });
			const body = updateThreadSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid request body" });

			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq, isNull, and }) =>
					and(eq(t.id, params.data.id), isNull(t.deletedAt)),
			});
			if (!thread)
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });
			if (thread.createdBy !== authUserId)
				return reply.status(403).send({ success: false, error: "Forbidden" });

			const updates: Partial<typeof threadsTable.$inferInsert> = {
				threadTitle: body.data.threadTitle ?? undefined,
				topicId: body.data.topicId ?? undefined,
				updatedBy: authUserId,
				updatedAt: new Date().toISOString(),
			};
			const [updated] = await DrizzleClient.update(threadsTable)
				.set(updates)
				.where(eq(threadsTable.id, params.data.id))
				.returning();
			return reply.status(200).send({ success: true, thread: updated });
		},
	);

	fastify.delete(
		"/threads/:id",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });
			const params = threadIdParamsSchema.safeParse(request.params);
			if (!params.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid thread id" });
			const [authUser, thread] = await Promise.all([
				DrizzleClient.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, authUserId),
					columns: { id: true, role: true },
				}),
				DrizzleClient.query.threads.findFirst({
					where: (t, { eq, isNull, and }) =>
						and(eq(t.id, params.data.id), isNull(t.deletedAt)),
				}),
			]);
			if (!authUser)
				return reply
					.status(404)
					.send({ success: false, error: "User not found" });
			if (!thread)
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });
			if (thread.createdBy !== authUserId && authUser.role !== "admin")
				return reply.status(403).send({ success: false, error: "Forbidden" });

			await DrizzleClient.update(threadsTable)
				.set({
					deletedAt: new Date().toISOString(),
					deletedBy: authUserId,
					updatedAt: new Date().toISOString(),
					updatedBy: authUserId,
				})
				.where(eq(threadsTable.id, params.data.id));
			return reply.status(204).send();
		},
	);
}

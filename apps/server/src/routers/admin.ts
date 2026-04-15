import { eq, and, desc, isNull, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "@/db/index";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { posts as postsTable } from "@/db/schema/post.schema";
import { reports as reportsTable } from "@/db/schema/report.schema";
import { topics as topicsTable } from "@/db/schema/topic.schema";
import { users as usersTable } from "@/db/schema/user.schema";
import { authenticateAdmin } from "./auth";

export async function adminRoutes(fastify: FastifyInstance) {
	// ─── Thread Admin ───────────────────────────────────────────────────

	fastify.get(
		"/admin/threads/pending",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const pending = await DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					topicId: threadsTable.topicId,
					topicName: topicsTable.topicName,
					createdAt: threadsTable.createdAt,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,
					authorName: usersTable.username,
				})
					.from(threadsTable)
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(threadsTable.isAnonymous, true),
							eq(threadsTable.isApproved, false),
							eq(threadsTable.isRejected, false),
						),
					)
					.orderBy(desc(threadsTable.createdAt));

				return reply.send({ success: true, threads: pending });
			} catch (error) {
				fastify.log.error("Error fetching pending threads:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch pending threads" });
			}
		},
	);

	fastify.get(
		"/admin/threads/approved",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const approved = await DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					topicId: threadsTable.topicId,
					topicName: topicsTable.topicName,
					createdAt: threadsTable.createdAt,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,
					authorName: usersTable.username,
				})
					.from(threadsTable)
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(threadsTable.isAnonymous, true),
							eq(threadsTable.isApproved, true),
							isNull(threadsTable.deletedAt),
						),
					)
					.orderBy(desc(threadsTable.createdAt));

				return reply.send({ success: true, threads: approved });
			} catch (error) {
				fastify.log.error("Error fetching approved threads:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch approved threads" });
			}
		},
	);

	fastify.get(
		"/admin/threads/rejected",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const rejected = await DrizzleClient.select({
					id: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					topicId: threadsTable.topicId,
					topicName: topicsTable.topicName,
					createdAt: threadsTable.createdAt,
					isAnonymous: threadsTable.isAnonymous,
					isApproved: threadsTable.isApproved,
					authorName: usersTable.username,
				})
					.from(threadsTable)
					.leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
					.leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(threadsTable.isAnonymous, true),
							eq(threadsTable.isRejected, true),
						),
					)
					.orderBy(desc(threadsTable.createdAt));

				return reply.send({ success: true, threads: rejected });
			} catch (error) {
				fastify.log.error("Error fetching rejected threads:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch rejected threads" });
			}
		},
	);

	fastify.patch(
		"/admin/threads/:id/approve",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const [updated] = await DrizzleClient.update(threadsTable)
					.set({ isApproved: true, isRejected: false })
					.where(eq(threadsTable.id, id))
					.returning();

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				return reply.send({ success: true, thread: updated });
			} catch (error) {
				fastify.log.error("Error approving thread:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to approve thread" });
			}
		},
	);

	fastify.patch(
		"/admin/threads/:id/reject",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const [updated] = await DrizzleClient.update(threadsTable)
					.set({ isApproved: false, isRejected: true })
					.where(eq(threadsTable.id, id))
					.returning();

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				return reply.send({ success: true, thread: updated });
			} catch (error) {
				fastify.log.error("Error rejecting thread:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to reject thread" });
			}
		},
	);

	// ─── Post Admin ─────────────────────────────────────────────────────

	fastify.get(
		"/admin/posts/pending",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const pending = await DrizzleClient.select({
					postId: postsTable.id,
					content: postsTable.content,
					createdAt: postsTable.createdAt,
					threadId: postsTable.threadId,
					threadTitle: threadsTable.threadTitle,
					authorName: usersTable.username,
					isAnonymous: postsTable.isAnonymous,
					isApproved: postsTable.isApproved,
					isRejected: postsTable.isRejected,
				})
					.from(postsTable)
					.leftJoin(threadsTable, eq(postsTable.threadId, threadsTable.id))
					.leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(postsTable.isAnonymous, true),
							eq(postsTable.isApproved, false),
							eq(postsTable.isRejected, false),
						),
					)
					.orderBy(desc(postsTable.createdAt));

				return reply.send({ success: true, posts: pending });
			} catch (error) {
				fastify.log.error("Error fetching pending posts:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch pending posts" });
			}
		},
	);

	fastify.get(
		"/admin/posts/approved",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const approved = await DrizzleClient.select({
					postId: postsTable.id,
					content: postsTable.content,
					createdAt: postsTable.createdAt,
					threadId: postsTable.threadId,
					threadTitle: threadsTable.threadTitle,
					authorName: usersTable.username,
					isAnonymous: postsTable.isAnonymous,
					isApproved: postsTable.isApproved,
					isRejected: postsTable.isRejected,
				})
					.from(postsTable)
					.leftJoin(threadsTable, eq(postsTable.threadId, threadsTable.id))
					.leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(postsTable.isAnonymous, true),
							eq(postsTable.isApproved, true),
						),
					)
					.orderBy(desc(postsTable.createdAt));

				return reply.send({ success: true, posts: approved });
			} catch (error) {
				fastify.log.error("Error fetching approved posts:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch approved posts" });
			}
		},
	);

	fastify.get(
		"/admin/posts/rejected",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const rejected = await DrizzleClient.select({
					postId: postsTable.id,
					content: postsTable.content,
					createdAt: postsTable.createdAt,
					threadId: postsTable.threadId,
					threadTitle: threadsTable.threadTitle,
					authorName: usersTable.username,
					isAnonymous: postsTable.isAnonymous,
					isApproved: postsTable.isApproved,
					isRejected: postsTable.isRejected,
				})
					.from(postsTable)
					.leftJoin(threadsTable, eq(postsTable.threadId, threadsTable.id))
					.leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
					.where(
						and(
							eq(postsTable.isAnonymous, true),
							eq(postsTable.isRejected, true),
						),
					)
					.orderBy(desc(postsTable.createdAt));

				return reply.send({ success: true, posts: rejected });
			} catch (error) {
				fastify.log.error("Error fetching rejected posts:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch rejected posts" });
			}
		},
	);

	fastify.patch(
		"/admin/posts/:id/approve",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const [updated] = await DrizzleClient.update(postsTable)
					.set({ isApproved: true, isRejected: false })
					.where(eq(postsTable.id, id))
					.returning();

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Post not found" });
				}

				return reply.send({ success: true, post: updated });
			} catch (error) {
				fastify.log.error("Error approving post:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to approve post" });
			}
		},
	);

	fastify.patch(
		"/admin/posts/:id/reject",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const [updated] = await DrizzleClient.update(postsTable)
					.set({ isApproved: false, isRejected: true })
					.where(eq(postsTable.id, id))
					.returning();

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Post not found" });
				}

				return reply.send({ success: true, post: updated });
			} catch (error) {
				fastify.log.error("Error rejecting post:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to reject post" });
			}
		},
	);

	fastify.get(
		"/admin/reports/pending",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const reports = await DrizzleClient.select({
					id: reportsTable.id,
					postId: postsTable.id,
					postContent: postsTable.content,
					threadId: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					reportedAt: reportsTable.createdAt,
					status: reportsTable.status,
					reportedBy: usersTable.username,
				})
					.from(reportsTable)
					.innerJoin(postsTable, eq(reportsTable.postId, postsTable.id))
					.innerJoin(threadsTable, eq(postsTable.threadId, threadsTable.id))
					.leftJoin(usersTable, eq(reportsTable.userId, usersTable.id))
					.where(and(eq(reportsTable.status, "pending"), isNull(postsTable.deletedAt)))
					.orderBy(desc(reportsTable.createdAt));

				return reply.send({ success: true, reports });
			} catch (error) {
				fastify.log.error("Error fetching pending reports:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch pending reports" });
			}
		},
	);

	fastify.get(
		"/admin/reports/resolved",
		{ preHandler: authenticateAdmin },
		async (_request, reply) => {
			try {
				const reports = await DrizzleClient.select({
					id: reportsTable.id,
					postId: postsTable.id,
					postContent: postsTable.content,
					threadId: threadsTable.id,
					threadTitle: threadsTable.threadTitle,
					reportedAt: reportsTable.createdAt,
					status: reportsTable.status,
					reportedBy: usersTable.username,
				})
					.from(reportsTable)
					.innerJoin(postsTable, eq(reportsTable.postId, postsTable.id))
					.innerJoin(threadsTable, eq(postsTable.threadId, threadsTable.id))
					.leftJoin(usersTable, eq(reportsTable.userId, usersTable.id))
					.where(eq(reportsTable.status, "resolved"))
					.orderBy(desc(reportsTable.createdAt));

				return reply.send({ success: true, reports });
			} catch (error) {
				fastify.log.error("Error fetching resolved reports:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch resolved reports" });
			}
		},
	);

	fastify.patch(
		"/admin/reports/:id/resolve",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };
			const adminId = request.userId;

			try {
				const [updated] = await DrizzleClient.update(reportsTable)
					.set({
						status: "resolved",
						resolvedAt: sql`now()`,
						resolvedBy: adminId,
					})
					.where(eq(reportsTable.id, id))
					.returning();

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Report not found" });
				}

				return reply.send({ success: true, report: updated });
			} catch (error) {
				fastify.log.error("Error resolving report:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to resolve report" });
			}
		},
	);

	fastify.patch(
		"/admin/reports/:id/delete-post",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };
			const adminId = request.userId;

			try {
				const result = await DrizzleClient.transaction(async (tx) => {
					const [report] = await tx
						.select({
							id: reportsTable.id,
							postId: reportsTable.postId,
							status: reportsTable.status,
						})
						.from(reportsTable)
						.where(eq(reportsTable.id, id))
						.limit(1);

					if (!report) return { type: "not_found" as const };

					const now = new Date().toISOString();

					const [deletedPost] = await tx
						.update(postsTable)
						.set({
							deletedAt: now,
							deletedBy: adminId,
							updatedAt: now,
							updatedBy: adminId,
						})
						.where(
							and(eq(postsTable.id, report.postId), isNull(postsTable.deletedAt)),
						)
						.returning({
							createdBy: postsTable.createdBy,
							isDraft: postsTable.isDraft,
							isAnonymous: postsTable.isAnonymous,
						});

					if (deletedPost && !deletedPost.isDraft && !deletedPost.isAnonymous) {
						await tx
							.update(usersTable)
							.set({
								totalPosts: sql`GREATEST(${usersTable.totalPosts} - 1, 0)`,
							})
							.where(eq(usersTable.id, deletedPost.createdBy));
					}

					const [resolvedReport] = await tx
						.update(reportsTable)
						.set({
							status: "resolved",
							resolvedAt: now,
							resolvedBy: adminId,
						})
						.where(eq(reportsTable.id, id))
						.returning();

					return {
						type: "ok" as const,
						report: resolvedReport,
					};
				});

				if (result.type === "not_found") {
					return reply
						.status(404)
						.send({ success: false, error: "Report not found" });
				}

				return reply.send({ success: true, report: result.report });
			} catch (error) {
				fastify.log.error("Error deleting reported post:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to delete reported post" });
			}
		},
	);
}

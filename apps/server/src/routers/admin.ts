import { eq, and, desc } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "@/db/index";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { posts as postsTable } from "@/db/schema/post.schema";
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
}

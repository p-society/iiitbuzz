import { eq, and, desc, isNull } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "@/db/index";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { topics as topicsTable } from "@/db/schema/topic.schema";
import { users as usersTable } from "@/db/schema/user.schema";
import { authenticateAdmin } from "./auth";

export async function adminRoutes(fastify: FastifyInstance) {
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
							isNull(threadsTable.deletedAt),
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
							eq(threadsTable.isApproved, false),
							isNull(threadsTable.deletedAt),
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
					.set({ isApproved: true })
					.where(and(eq(threadsTable.id, id), isNull(threadsTable.deletedAt)))
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

	fastify.delete(
		"/admin/threads/:id/reject",
		{ preHandler: authenticateAdmin },
		async (request, reply) => {
			const { id } = request.params as { id: string };
			const adminId = request.userId;

			if (!adminId) {
				return reply.status(401).send({ success: false, error: "Unauthorized" });
			}

			try {
				const [updated] = await DrizzleClient.update(threadsTable)
					.set({
						deletedAt: new Date().toISOString(),
						deletedBy: adminId,
						updatedAt: new Date().toISOString(),
						updatedBy: adminId,
					})
					.where(and(eq(threadsTable.id, id), isNull(threadsTable.deletedAt)))
					.returning({ id: threadsTable.id });

				if (!updated) {
					return reply
						.status(404)
						.send({ success: false, error: "Thread not found" });
				}

				return reply.send({ success: true });
			} catch (error) {
				fastify.log.error("Error rejecting thread:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to reject thread" });
			}
		},
	);
}

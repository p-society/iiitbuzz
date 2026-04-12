import { eq, desc, and } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { DrizzleClient } from "@/db/index";
import { notifications as notifTable } from "@/db/schema/notification.schema";
import { users as usersTable } from "@/db/schema/user.schema";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { markReadSchema } from "@/dto/notifications.dto";
import { authenticateUser } from "./auth";

export async function notificationRoutes(fastify: FastifyInstance) {
	// Get notifications for current user
	fastify.get(
		"/notifications",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			try {
				const notifs = await DrizzleClient.select({
					id: notifTable.id,
					type: notifTable.type,
					threadId: notifTable.threadId,
					fromUserId: notifTable.fromUserId,
					message: notifTable.message,
					read: notifTable.read,
					createdAt: notifTable.createdAt,
					fromUsername: usersTable.username,
					threadTitle: threadsTable.threadTitle,
				})
					.from(notifTable)
					.leftJoin(usersTable, eq(notifTable.fromUserId, usersTable.id))
					.leftJoin(threadsTable, eq(notifTable.threadId, threadsTable.id))
					.where(eq(notifTable.userId, authUserId))
					.orderBy(desc(notifTable.createdAt))
					.limit(50);

				const unreadCount = await DrizzleClient.select({ id: notifTable.id })
					.from(notifTable)
					.where(
						and(eq(notifTable.userId, authUserId), eq(notifTable.read, false)),
					);

				return reply.status(200).send({
					success: true,
					notifications: notifs,
					unreadCount: unreadCount.length,
				});
			} catch (error) {
				fastify.log.error("Error fetching notifications:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch notifications" });
			}
		},
	);

	// Mark notifications as read
	fastify.put(
		"/notifications/read",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			try {
				await DrizzleClient.update(notifTable)
					.set({ read: true })
					.where(eq(notifTable.userId, authUserId));

				return reply.status(200).send({ success: true });
			} catch (error) {
				fastify.log.error("Error marking notifications:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to mark notifications" });
			}
		},
	);

	// Mark specific notification as read
	fastify.put(
		"/notifications/:id/read",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			const { id } = request.params as { id: string };

			try {
				await DrizzleClient.update(notifTable)
					.set({ read: true })
					.where(and(eq(notifTable.id, id), eq(notifTable.userId, authUserId)));

				return reply.status(200).send({ success: true });
			} catch (error) {
				fastify.log.error("Error marking notification:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to mark notification" });
			}
		},
	);
}

import { count } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "../db/index";
import { posts as postsTable } from "../db/schema/post.schema";
import { threads as threadsTable } from "../db/schema/thread.schema";
import { topics as topicsTable } from "../db/schema/topic.schema";
import { users as usersTable } from "../db/schema/user.schema";
import { optionalAuth } from "./auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function statsRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/stats",
		{
			preHandler: optionalAuth,
		},
		async (request, reply) => {
			try {
				const [topicsCount, threadsCount, postsCount, usersCount] =
					await Promise.all([
						DrizzleClient.select({ total: count() }).from(topicsTable),
						DrizzleClient.select({ total: count() }).from(threadsTable),
						DrizzleClient.select({ total: count() }).from(postsTable),
						DrizzleClient.select({ total: count() }).from(usersTable),
					]);

				return reply.status(200).send({
					success: true,
					stats: {
						totalTopics: topicsCount[0]?.total ?? 0,
						totalThreads: threadsCount[0]?.total ?? 0,
						totalPosts: postsCount[0]?.total ?? 0,
						totalMembers: usersCount[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error("Error fetching stats:", error);
				return reply.status(500).send({
					success: false,
					error: "Failed to fetch stats",
				});
			}
		}
	);
	fastify.get(
		"/stats/:userId",
		{
			preHandler: optionalAuth,
		},
		async (request, reply) => {
			try {
				const paramsSchema = z.object({
					userId: z.string().uuid(),
				});
				const { userId } = paramsSchema.parse(request.params);
				const [threadResult, topicResult] = await Promise.all([
					DrizzleClient.select({ total: count() })
						.from(threadsTable)
						.where(eq(threadsTable.createdBy, userId)),
					DrizzleClient.select({ total: count() })
						.from(topicsTable)
						.where(eq(topicsTable.createdBy, userId)),
				]);

				return reply.status(200).send({
					success: true,
					stats: {
						totalTopics: topicResult[0]?.total ?? 0,
						totalThreads: threadResult[0]?.total ?? 0,
					},
				});
			} catch (error) {
				fastify.log.error("Error fetching stats:", error);
				return reply.status(500).send({
					success: false,
					error: "Failed to fetch stats",
				});
			}
		}
	);
}

import { eq, and, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "@/db/index";
import { votes as votesTable } from "@/db/schema/vote.schema";
import { posts as postsTable } from "@/db/schema/post.schema";
import { voteSchema, postIdParamsSchema } from "@/dto/votes.dto";
import { authenticateUser } from "./auth";

export async function voteRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/posts/:postId/vote",
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
					.send({ success: false, error: "Invalid post ID" });

			const body = voteSchema.safeParse(request.body);
			if (!body.success)
				return reply
					.status(400)
					.send({ success: false, error: "Invalid vote data" });

			const { postId, value } = body.data;

			const post = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq }) => eq(p.id, postId),
			});
			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Post not found" });

			try {
				const existing = await DrizzleClient.query.votes.findFirst({
					where: (v, { eq, and }) =>
						and(eq(v.userId, authUserId), eq(v.postId, postId)),
				});

				if (existing) {
					if (existing.value === value) {
						await DrizzleClient.delete(votesTable).where(
							and(
								eq(votesTable.userId, authUserId),
								eq(votesTable.postId, postId),
							),
						);
						await DrizzleClient.update(postsTable)
							.set({ vote: sql`${postsTable.vote} - ${value}` })
							.where(eq(postsTable.id, postId));
						return reply
							.status(200)
							.send({ success: true, voted: false, value: 0 });
					} else {
						await DrizzleClient.update(votesTable)
							.set({ value })
							.where(
								and(
									eq(votesTable.userId, authUserId),
									eq(votesTable.postId, postId),
								),
							);
						await DrizzleClient.update(postsTable)
							.set({ vote: sql`${postsTable.vote} + ${value * 2}` })
							.where(eq(postsTable.id, postId));
						return reply
							.status(200)
							.send({ success: true, voted: true, value });
					}
				} else {
					await DrizzleClient.insert(votesTable).values({
						userId: authUserId,
						postId,
						value,
					});
					await DrizzleClient.update(postsTable)
						.set({ vote: sql`${postsTable.vote} + ${value}` })
						.where(eq(postsTable.id, postId));
					return reply.status(200).send({ success: true, voted: true, value });
				}
			} catch (error) {
				fastify.log.error("Error voting:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to vote" });
			}
		},
	);

	fastify.get(
		"/posts/:postId/vote",
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
					.send({ success: false, error: "Invalid post ID" });

			try {
				const vote = await DrizzleClient.query.votes.findFirst({
					where: (v, { eq, and }) =>
						and(eq(v.userId, authUserId), eq(v.postId, params.data.postId)),
				});
				return reply.status(200).send({
					success: true,
					vote: vote ? vote.value : 0,
				});
			} catch (error) {
				fastify.log.error("Error fetching vote:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to fetch vote" });
			}
		},
	);
}

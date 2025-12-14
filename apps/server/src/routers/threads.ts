import { count, eq } from "drizzle-orm";
import type { FastifyInstance , FastifyRequest} from "fastify";
import {
	createThreadSchema,
	threadIdParamsSchema,
	updateThreadSchema,
} from "@/dto/threads.dto";
import { DrizzleClient } from "../db/index";
import { threads as threadsTable } from "../db/schema/thread.schema";
import { attachUser, authenticateUser } from "./auth";
import { topicIdParamsSchema } from "@/dto/topics.dto";

export async function threadRoutes(fastify: FastifyInstance) {
	fastify.get(
    "/topics/:id/threads",
    {
	  preHandler: [authenticateUser , attachUser ],
      schema: {
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { page: number; limit: number };
      }>,
      reply
    ) => {
      const { page, limit } = request.query;
      const offset = (page - 1) * limit;
      const params = topicIdParamsSchema.safeParse(request.params);
      if (!params.success)
        return reply
          .status(400)
          .send({ success: false, error: "Invalid topic ID" });
      const topicId = params.data.id;
      try {
                const [relatedThreads, countResult] = await Promise.all([
          DrizzleClient.query.threads.findMany({
            where: (t, { eq }) => eq(t.topicId, topicId),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit: limit,
            offset: offset,
          }),
          DrizzleClient.select({ total: count() })
            .from(threadsTable)
            .where(eq(threadsTable.topicId, topicId)),
        ]);

        return reply.status(200).send({
          success: true,
          threads: relatedThreads,
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
    }
  );



	fastify.get(
    "/threads/:id",
    { 	  preHandler: [authenticateUser , attachUser ], },
    async (request, reply) => {
      const params = threadIdParamsSchema.safeParse(request.params);
      if (!params.success) {
        return reply
          .status(400)
          .send({ success: false, error: "Invalid thread id" });
      }
      try {
        const thread = await DrizzleClient.query.threads.findFirst({
          where: (t, { eq }) => eq(t.id, params.data.id),
        });
        if (!thread) {
          return reply
            .status(404)
            .send({ success: false, error: "Thread not found" });
        }
        return reply.status(200).send({ success: true, thread });
      } catch (error) {
        fastify.log.error("Error fetching thread:", error);
        return reply
          .status(500)
          .send({ success: false, error: "Failed to fetch thread" });
      }
    }
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
			};
			try {
				const [newThread] = await DrizzleClient.insert(threadsTable)
					.values(toInsert)
					.returning();
				return reply.status(201).send({ success: true, thread: newThread });
			} catch (error) {
				fastify.log.error("Error creating thread:", error);
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
				where: (t, { eq }) => eq(t.id, params.data.id),
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
			const thread = await DrizzleClient.query.threads.findFirst({
				where: (t, { eq }) => eq(t.id, params.data.id),
			});
			if (!thread)
				return reply
					.status(404)
					.send({ success: false, error: "Thread not found" });
			if (thread.createdBy !== authUserId)
				return reply.status(403).send({ success: false, error: "Forbidden" });
			await DrizzleClient.delete(threadsTable).where(
				eq(threadsTable.id, params.data.id),
			);
			return reply.status(204).send();
		},
	);
}

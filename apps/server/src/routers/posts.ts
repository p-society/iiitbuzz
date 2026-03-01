import { count, eq , sql} from "drizzle-orm";
import type { FastifyInstance , FastifyRequest} from "fastify";
import { DrizzleClient } from "@/db/index";
import { posts as postsTable } from "@/db/schema/post.schema";
import { users as usersTable } from "@/db/schema/user.schema";
import {
	createPostSchema,
	postIdParamsSchema,
	updatePostSchema,
} from "@/dto/posts.dto";
import { threadIdParamsSchema } from "@/dto/threads.dto";
import { attachUser, authenticateUser } from "./auth";

export async function postRoutes(fastify: FastifyInstance) {

	fastify.get(
    "/threads/:id/posts",
    {
	  preHandler: [authenticateUser , attachUser],
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
      reply
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
        const postsQuery = DrizzleClient.select({
            postId: postsTable.id,
            content: postsTable.content,
            createdAt: postsTable.createdAt,
            likes: postsTable.vote, 
            
            authorId: usersTable.id,
            authorName:sql<string>`
                CASE 
                    WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username} 
                    ELSE ${usersTable.firstName} 
                END
            `.as('authorName'), 
           
            
            
        })
        .from(postsTable)
        .leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
        .where(eq(postsTable.threadId, threadId))
        .orderBy(postsTable.createdAt)
        .limit(limit)
        .offset(offset);

        const countQuery = DrizzleClient.select({ total: count() })
            .from(postsTable)
            .where(eq(postsTable.threadId, threadId));

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
    }
  );
	
    fastify.get(
        "/posts/:id",
        { 	  preHandler: [authenticateUser , attachUser ], },
        async (request, reply) => {
            const params = postIdParamsSchema.safeParse(request.params);
            if (!params.success) {
                return reply.status(400).send({ success: false, error: "Invalid post id" });
            }
            try {
                const post = await DrizzleClient.query.posts.findFirst({
                    where: (p, { eq }) => eq(p.id, params.data.id),
                });
                if (!post) {
                    return reply.status(404).send({ success: false, error: "Post not found" });
                }
                return reply.status(200).send({ success: true, post });
            } catch (error) {
                fastify.log.error("Error fetching post:", error);
                return reply.status(500).send({ success: false, error: "Failed to fetch post" });
            }
        }
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
				where: (t, { eq }) => eq(t.id, body.data.threadId),
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
				const [newPost] = await tx.insert(postsTable)
					.values(toInsert)
					.returning();
				await tx.update(usersTable)
					.set({
						totalPosts: sql`${usersTable.totalPosts} + 1`
					})
					.where(eq(usersTable.id, authUserId));
				return newPost;
			});

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
				where: (p, { eq }) => eq(p.id, params.data.id),
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
			const post = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq }) => eq(p.id, params.data.id),
			});
			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Post not found" });
			if (post.createdBy !== authUserId)
				return reply.status(403).send({ success: false, error: "Forbidden" });
			await DrizzleClient.delete(postsTable).where(
				eq(postsTable.id, params.data.id),
			);
			return reply.status(204).send();
		},
	);
}

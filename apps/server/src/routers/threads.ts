import { count, eq, sql, desc,  ilike } from "drizzle-orm";
import type { FastifyInstance , FastifyRequest} from "fastify";
import {
	createThreadSchema,
	threadIdParamsSchema,
	updateThreadSchema,
} from "@/dto/threads.dto";
import { DrizzleClient } from "../db/index";
import { threads as threadsTable } from "../db/schema/thread.schema";
import { posts as postsTable } from "../db/schema/post.schema"; // For counting replies/last active
import { users as usersTable } from "../db/schema/user.schema";
import { topics as topicsTable } from "../db/schema/topic.schema";
import { attachUser, authenticateUser, optionalAuth } from "./auth";
import { topicIdParamsSchema } from "@/dto/topics.dto";

export async function threadRoutes(fastify: FastifyInstance) {
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
                sort: { type: "string", enum: ["latest", "top", "trending", "views"], default: "latest" },
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
                    orderBy = desc(sql`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`); 
                    break;
            }
    
            const selectQuery = DrizzleClient.select({
                id: threadsTable.id,
                title: threadsTable.threadTitle,
                createdAt: threadsTable.createdAt,
                topicId: threadsTable.topicId,
                views: threadsTable.viewCount,
              
                authorName: sql<string>`
                    CASE 
                        WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username} 
                        ELSE ${usersTable.firstName} 
                    END
                `.as('authorName'),
               
                replies: sql<number>`GREATEST(COUNT(${postsTable.id}) - 1, 0)`.as('replies'),  
                lastActive: sql<string>`MAX(${postsTable.createdAt})`.as('lastActive'),
                likes: sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`.as('likes'),
                topicName: topicsTable.topicName,
                isPinned: sql<boolean>`FALSE`.as('isPinned'),
    
            })
            .from(threadsTable)
            .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
            .leftJoin(postsTable, eq(postsTable.threadId, threadsTable.id))
            .leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id));
            
           
            const withSearch = (search && search.trim())
                ? selectQuery.where(ilike(threadsTable.threadTitle, `%${search.trim()}%`))
                : selectQuery;
            
            const threadsQuery = withSearch
                .groupBy(
                    threadsTable.id, 
                    threadsTable.threadTitle, 
                    threadsTable.createdAt,
                    threadsTable.topicId,
                    threadsTable.viewCount,
                    usersTable.username,
                    usersTable.firstName,
                    topicsTable.topicName
                )
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
    
           
            const countBase = DrizzleClient.select({ total: count() }).from(threadsTable);
            const countQuery = (search && search.trim())
                ? countBase.where(ilike(threadsTable.threadTitle, `%${search.trim()}%`))
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
            return reply
              .status(500)
              .send({ success: false, error: "Failed to fetch threads due to internal database error." });
          }
        }
    );
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
            sort: { type: "string", enum: ["latest", "top", "trending", "views"], default: "latest" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { page: number; limit: number; sort?: "latest" | "top" | "trending" | "views" };
      }>,
      reply
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
            orderBy = desc(sql`COALESCE(MAX(${postsTable.createdAt}), ${threadsTable.createdAt})`);
            break;
        }

        const threadsQuery = DrizzleClient.select({
          id: threadsTable.id,
          threadTitle: threadsTable.threadTitle,
          createdAt: threadsTable.createdAt,
          topicId: threadsTable.topicId,
          viewCount: threadsTable.viewCount,
          createdBy: threadsTable.createdBy,
          
          authorName: sql<string>`
            CASE 
              WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username} 
              ELSE ${usersTable.firstName} 
            END
          `.as('authorName'),
          
          replies: sql<number>`COUNT(${postsTable.id}) - 1`.as('replies'),
          lastActive: sql<string>`MAX(${postsTable.createdAt})`.as('lastActive'),
          likes: sql<number>`COALESCE(SUM(${postsTable.vote}), 0)`.as('likes'),
        })
        .from(threadsTable)
        .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
        .leftJoin(postsTable, eq(postsTable.threadId, threadsTable.id))
        .where(eq(threadsTable.topicId, topicId))
        .groupBy(
          threadsTable.id,
          threadsTable.threadTitle,
          threadsTable.createdAt,
          threadsTable.topicId,
          threadsTable.viewCount,
          threadsTable.createdBy,
          usersTable.username,
          usersTable.firstName
        )
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

        const [relatedThreads, countResult] = await Promise.all([
          threadsQuery,
          DrizzleClient.select({ total: count() })
            .from(threadsTable)
            .where(eq(threadsTable.topicId, topicId)),
        ]);

         
        const threadsWithStats = relatedThreads.map((thread) => ({
          id: thread.id,
          threadTitle: thread.threadTitle,
          createdAt: thread.createdAt,
          topicId: thread.topicId,
          viewCount: thread.viewCount ?? 0,
          author: { username: thread.authorName || "Anonymous" },
          replyCount: Math.max(0, thread.replies ?? 0),
          likes: thread.likes ?? 0,
          isPinned: false,
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
    }
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
        topicName: topicsTable.topicName,
        authorName: sql<string>`
          CASE 
            WHEN ${usersTable.username} IS NOT NULL THEN ${usersTable.username} 
            ELSE ${usersTable.firstName} 
          END
        `.as('authorName'),
      })
      .from(threadsTable)
      .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.id))
      .leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.id))
      .where(eq(threadsTable.id, params.data.id))
      .limit(1);

      const thread = threadData[0];

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

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { searchThreads } from "@/service/searchThread.service";
import { searchTopics } from "@/service/searchTopic.service";
import { searchPosts } from "@/service/searchPost.service";
import { generalSearch } from "@/service/searchGeneral.service";
import { attachUser, authenticateUser } from "./auth";
export async function searchRoutes(fastify: FastifyInstance) {
    
    fastify.get(
        "/search/thread",
        {
		preHandler: [authenticateUser, attachUser],
	     },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const q = (req.query as any).q || "";
            const page = Number((req.query as any).page) || 1;

            return await searchThreads(q, page);
        }
    );

    fastify.get(
        "/search/topic",
         {
		preHandler: [authenticateUser, attachUser],
	     },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const q = (req.query as any).q || "";
            const page = Number((req.query as any).page) || 1;

            return await searchTopics(q, page);
        }
    );

    fastify.get(
        "/search/post",
        {
		preHandler: [authenticateUser, attachUser],
	     },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const q = (req.query as any).q || "";
            const page = Number((req.query as any).page) || 1;

            return await searchPosts(q, page);
        }
    );

    fastify.get(
        "/search",
        {
		preHandler: [authenticateUser, attachUser],
	     },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const q = (req.query as any).q || "";
            const page = Number((req.query as any).page) || 1;

            return await generalSearch(q, page);
        }
    );
}

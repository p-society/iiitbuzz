import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { postRoutes } from "./posts";
import { statsRoutes } from "./stats";
import { threadRoutes } from "./threads";
import { topicRoutes } from "./topics";
import { userRoutes } from "./user";

export async function appRouter(fastify: FastifyInstance) {
	fastify.decorateRequest("userId", undefined);
	fastify.register(authRoutes, { prefix: "/api/auth" });
	fastify.register(userRoutes, { prefix: "/api/user" });
	fastify.register(topicRoutes, { prefix: "/api" });
	fastify.register(threadRoutes, { prefix: "/api" });
	fastify.register(postRoutes, { prefix: "/api" });
	fastify.register(statsRoutes, { prefix: "/api" });
}

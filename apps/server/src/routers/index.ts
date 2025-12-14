import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { postRoutes } from "./posts";
import { threadRoutes } from "./threads";
import { topicRoutes } from "./topics";
import { userRoutes } from "./user";
import { searchRoutes } from "./search";
export async function appRouter(fastify: FastifyInstance) {
	// Ensure the request object has a userId property at runtime
	// Middleware will assign the real ID when authenticated
	fastify.decorateRequest("userId", undefined);
	fastify.register(authRoutes, { prefix: "/auth" });
	fastify.register(userRoutes, { prefix: "/user" });
	fastify.register(topicRoutes);
	fastify.register(threadRoutes);
	fastify.register(postRoutes);
	fastify.register(searchRoutes);
}

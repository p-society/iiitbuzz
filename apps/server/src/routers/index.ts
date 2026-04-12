import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { postRoutes } from "./posts";
import { statsRoutes } from "./stats";
import { threadRoutes } from "./threads";
import { topicRoutes } from "./topics";
import { userRoutes } from "./user";
import { voteRoutes } from "./votes";
import { notificationRoutes } from "./notifications";
import { uploadRoutes } from "./uploads";
import { adminRoutes } from "./admin";

export async function appRouter(fastify: FastifyInstance) {
	fastify.decorateRequest("userId", undefined);
	fastify.register(authRoutes, { prefix: "/api/auth" });
	fastify.register(userRoutes, { prefix: "/api/user" });
	fastify.register(topicRoutes, { prefix: "/api" });
	fastify.register(threadRoutes, { prefix: "/api" });
	fastify.register(postRoutes, { prefix: "/api" });
	fastify.register(statsRoutes, { prefix: "/api" });
	fastify.register(voteRoutes, { prefix: "/api" });
	fastify.register(notificationRoutes, { prefix: "/api" });
	fastify.register(uploadRoutes, { prefix: "/api" });
	fastify.register(adminRoutes, { prefix: "/api" });
}

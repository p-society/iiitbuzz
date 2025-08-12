import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { userRoutes } from "./user";

export async function appRouter(fastify: FastifyInstance) {
	fastify.register(authRoutes, { prefix: "/auth" });
	fastify.register(userRoutes, { prefix: "/user" });
}

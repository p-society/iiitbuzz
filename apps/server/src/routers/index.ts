import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";

export async function appRouter(fastify: FastifyInstance) {
	fastify.register(authRoutes, { prefix: "/auth" });
}

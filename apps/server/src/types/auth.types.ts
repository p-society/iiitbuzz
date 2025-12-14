import { users } from "@/db/schema/user.schema";
import type { FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedRequest extends FastifyRequest {
	user: typeof users.$inferSelect;
	userId: string;
}

export type AuthenticationMiddleware = (
	request: FastifyRequest,
	reply: FastifyReply,
) => Promise<void>;

export type AuthenticatedRouteHandler = (
	request: AuthenticatedRequest,
	reply: FastifyReply,
) => Promise<void>;

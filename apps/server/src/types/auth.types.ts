import type { FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedRequest extends FastifyRequest {
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

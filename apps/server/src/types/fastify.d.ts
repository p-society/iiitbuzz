import "@fastify/oauth2";
import { FastifyRequest, FastifyReply } from "fastify";

interface OAuth2Token {
	access_token: string;
	refresh_token?: string;
	id_token?: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

interface OAuth2TokenResult {
	token: OAuth2Token;
}

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: {
			getAccessTokenFromAuthorizationCodeFlow(
				request: FastifyRequest,
			): Promise<OAuth2TokenResult>;
			generateAuthorizationUri(
				request: FastifyRequest,
				reply: FastifyReply,
			): Promise<void>;
		};
	}
}

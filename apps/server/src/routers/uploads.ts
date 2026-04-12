import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { FastifyInstance } from "fastify";
import { DrizzleClient } from "@/db/index";
import { posts as postsTable } from "@/db/schema/post.schema";
import { eq, and } from "drizzle-orm";
import { env } from "../envSchema";
import { authenticateUser } from "./auth";

const EXT_MAP: Record<string, string> = {
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/gif": ".gif",
	"image/webp": ".webp",
};

const ALLOWED_TYPES = new Set(Object.keys(EXT_MAP));

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
	requestHandler: {
		requestChecksumCalculation: "SKIP",
	},
});

export async function uploadRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/upload/presign",
		{ preHandler: authenticateUser },
		async (request, reply) => {
			const authUserId = request.userId;
			if (!authUserId)
				return reply
					.status(401)
					.send({ success: false, error: "Unauthorized" });

			const body = request.body as {
				postId?: string;
				imageId?: string;
				contentType?: string;
			};

			if (!body.postId || !body.imageId || !body.contentType)
				return reply
					.status(400)
					.send({ success: false, error: "Missing required fields" });

			const { postId, imageId, contentType } = body;

			if (!ALLOWED_TYPES.has(contentType))
				return reply
					.status(400)
					.send({ success: false, error: "Only images allowed" });

			const post = await DrizzleClient.query.posts.findFirst({
				where: (p, { eq, and }) =>
					and(
						eq(p.id, postId),
						eq(p.createdBy, authUserId),
						eq(p.isDraft, true),
					),
			});

			if (!post)
				return reply
					.status(404)
					.send({ success: false, error: "Draft post not found" });

			const ext = EXT_MAP[contentType] || ".jpg";
			const key = `posts/${postId}/${imageId}${ext}`;

			try {
				const command = new PutObjectCommand({
					Bucket: env.R2_BUCKET_NAME,
					Key: key,
					ContentType: contentType,
				});

				const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
				const fileUrl = `${env.R2_PUBLIC_URL}/${key}`;

				return reply.status(200).send({
					success: true,
					uploadUrl,
					fileUrl,
				});
			} catch (error) {
				fastify.log.error("Error generating presigned URL:", error);
				return reply
					.status(500)
					.send({ success: false, error: "Failed to generate upload URL" });
			}
		},
	);
}

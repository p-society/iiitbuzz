import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { handlePostVote } from "@/service/vote.service";
import { attachUser, authenticateUser } from "./auth";

type VoteParams = {
  postId: string;
};

type VoteBody = {
  voteValue: 1 | -1 | 0;
};

export async function voteRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Params: VoteParams;
    Body: VoteBody;
  }>(
    "/posts/:postId/vote",
    {
      preHandler: [authenticateUser, attachUser],
      schema: {
        params: z.object({
          postId: z.string().uuid(),
        }),
        body: z.object({
          voteValue: z.union([
            z.literal(1),
            z.literal(-1),
            z.literal(0),
          ]),
        }),
      },
    },
    async (request, reply) => {
      const { postId } = request.params;  
      const { voteValue } = request.body; 
      const userId = request.userId;

      if (!userId) {
             return reply.code(401).send({ error: "Unauthorized" });
        }
      const updatedPost = await handlePostVote(
        postId,
        userId,
        voteValue
      );

      return reply.send({
        success: true,
        data: updatedPost,
      });
    }
  );
}
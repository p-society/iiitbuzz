import { z } from "zod";

export const postIdParamsSchema = z.object({
  postId: z.string().uuid(),
});
export const votePayloadSchema = z.object({
  voteValue: z.union([z.literal(1),z.literal(-1),z.literal(0),
  ]),
});
export type VotePayloadInput = z.infer<typeof votePayloadSchema>;
export type PostIdParams = z.infer<typeof postIdParamsSchema>;

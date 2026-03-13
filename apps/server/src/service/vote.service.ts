import { and, eq, isNull, sql } from "drizzle-orm";
import { DrizzleClient as db } from "@/db";
import { votes } from "@/db/schema/votes.schema";
import { posts } from "@/db/schema/post.schema";

export async function handlePostVote(
  postId: string,
  userId: string,
  voteValue: 1 | -1 | 0,
) {
  return db.transaction(async (tx) => {
    // fetch existing active vote
    const [existingVote] = await tx
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.postId, postId),
          eq(votes.userId, userId),
          isNull(votes.deletedAt),
        ),
      )
      .limit(1);

    const oldVoteValue = existingVote
      ? existingVote.isUpvote? 1:-1: 0;
    const delta = voteValue - oldVoteValue;

    // remove vote (soft delete)
    if (voteValue === 0) {
      if (existingVote) {
        await tx
          .update(votes)
          .set({ deletedAt: new Date().toISOString() })
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.postId, postId),
            ),
          );
      }
    } else {
      // insert or update vote
      await tx
        .insert(votes)
        .values({
          userId,
          postId,
          isUpvote: voteValue === 1,
          isDownvote: voteValue === -1,
          deletedAt: null,
        })
        .onConflictDoUpdate({
          target: [votes.userId, votes.postId],
          set: {
            isUpvote: voteValue === 1,
            isDownvote: voteValue === -1,
            deletedAt: sql`NULL`,
          },
        });
    }

    // update post vote count
    const [updatedPost] = await tx
      .update(posts)
      .set({
        vote: sql`${posts.vote} + ${delta}`,
      })
      .where(eq(posts.id, postId))
      .returning();

    if (!updatedPost) {
      tx.rollback();
      throw new Error("Post not found");
    }

    return updatedPost;
  });
}

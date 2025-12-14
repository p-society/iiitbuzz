import { sql, desc } from "drizzle-orm";
import { DrizzleClient as db } from "@/db/index";
import { buildSearchParams } from "./searchParam.service";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { topics as topicsTable } from "@/db/schema/topic.schema";
import { posts as postsTable } from "@/db/schema/post.schema";
import { buildSearchQuery } from "./buildSearchQuery";

export async function generalSearch(q: string, page = 1) {
       const {
   limit,
   offset,
   tsQuery,
   prefixQuery,
   tsv,
 } = buildSearchParams(q, page);

    const threadRows = await buildSearchQuery({
        table: threadsTable,
        titleExpr: sql<string>`${threadsTable.threadTitle}`.as("title"),
        whereExpr: sql`${tsv} @@ ${tsQuery} OR ${tsv} @@ ${prefixQuery}`,
        scoreExpr: sql`
            ts_rank_cd(${tsv}, ${tsQuery})
            + 0.5 * ts_rank_cd(${tsv}, ${prefixQuery})
        `.as("score"),
        limit: 200,
        offset: 0,
    });

    const threadResults = threadRows.map(r => ({
        id: r.id,
        type: "thread",
        title: r.title,
        score: r.score,
    }));
    const tsvTopic = sql`to_tsvector('english', topic_name)`;
    const topicRows = await buildSearchQuery({
        table: topicsTable,
        titleExpr: sql<string>`${topicsTable.topicName}`.as("title"),
        whereExpr: sql`${tsvTopic} @@ ${tsQuery} OR ${tsvTopic} @@ ${prefixQuery}`,
        scoreExpr: sql`
            ts_rank_cd(${tsvTopic}, ${tsQuery})
            + 0.7 * ts_rank_cd(${tsvTopic}, ${prefixQuery})
        `.as("score"),
        limit: 200,
        offset: 0,
    });
    const topicResults = topicRows.map(r => ({
        id: r.id,
        type: "topic",
        title: r.title,
        score: r.score,
    }));
    const tsvPost = sql`to_tsvector('english', content)`;
    const postRows = await buildSearchQuery({
        table: postsTable,
        titleExpr: sql<string>`substring(${postsTable.content}, 1, 120)`.as("title"),
        whereExpr: sql`${tsvPost} @@ ${tsQuery} OR ${tsvPost} @@ ${prefixQuery}`,
        scoreExpr: sql`
            ts_rank_cd(${tsvPost}, ${tsQuery})
            + 0.3 * ts_rank_cd(${tsvPost}, ${prefixQuery})
        `.as("score"),
        limit: 200,
        offset: 0,
    });
    const postResults = postRows.map(r => ({
        id: r.id,
        type: "post",
        title: r.title,
        score: r.score,
    }));
    const merged = [...threadResults, ...topicResults, ...postResults];
    merged.sort((a, b) => Number(b.score) - Number(a.score));
    const paginated = merged.slice(offset, offset + limit);
    return {
        results: paginated,
        totalCount: merged.length,
        totalPages: Math.ceil(merged.length / limit),
        page
    };
}

import { sql } from "drizzle-orm";
import { topics as topicsTable } from "@/db/schema/topic.schema";
import { buildSearchQuery } from "./buildSearchQuery";
import { buildSearchParams } from "./searchParam.service";
export async function searchTopics(q: string, page = 1) {
   const {
  limit,
  offset,
  tsQuery,
  prefixQuery,
  tsv,
} = buildSearchParams(q, page);

    const rows = await buildSearchQuery({
        table: topicsTable,
        titleExpr: sql<string>`${topicsTable.topicName}`.as("title"),
        whereExpr: sql`${tsv} @@ ${tsQuery} OR ${tsv} @@ ${prefixQuery}`,
        scoreExpr: sql`
            ts_rank_cd(${tsv}, ${tsQuery})
            + 0.7 * ts_rank_cd(${tsv}, ${prefixQuery})
        `.as("score"),
        limit,
        offset
    });

    const totalCount = rows[0]?.full_count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        results: rows.map(r => ({ ...r, full_count: undefined })),
        totalCount,
        totalPages,
        page
    };
}

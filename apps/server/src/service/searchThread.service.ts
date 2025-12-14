import { sql } from "drizzle-orm";
import { threads as threadsTable } from "@/db/schema/thread.schema";
import { buildSearchQuery } from "./buildSearchQuery";
import { buildSearchParams } from "./searchParam.service";

export async function searchThreads(q: string, page = 1) {
   const {
  limit,
  offset,
  tsQuery,
  prefixQuery,
  tsv,
} = buildSearchParams(q, page);


    const rows = await buildSearchQuery({
        table: threadsTable,
        titleExpr: sql<string>`${threadsTable.threadTitle}`.as("title"),
        whereExpr: sql`${tsv} @@ ${tsQuery} OR ${tsv} @@ ${prefixQuery}`,
        scoreExpr: sql`
            ts_rank_cd(${tsv}, ${tsQuery})
            + 0.5 * ts_rank_cd(${tsv}, ${prefixQuery})
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

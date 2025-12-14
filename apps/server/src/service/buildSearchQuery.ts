import { sql, desc } from "drizzle-orm";
import { DrizzleClient as db } from "@/db/index";

export function buildSearchQuery({
    table,
    titleExpr,
    whereExpr,
    scoreExpr,
    limit,
    offset
}: {
    table: any;
    titleExpr: any;
    whereExpr: any;
    scoreExpr: any;
    limit: number;
    offset: number;
}) {
    return db
        .select({
            id: table.id,
            title: titleExpr,
            score: scoreExpr,
            full_count: sql<number>`count(*) OVER()`.as("full_count"),
        })
        .from(table)
        .where(whereExpr)
        .orderBy(desc(sql`score`))
        .limit(limit)
        .offset(offset);
}

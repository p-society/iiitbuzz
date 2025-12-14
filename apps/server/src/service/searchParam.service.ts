import { sql } from "drizzle-orm";

export function buildSearchParams(q: string, page: number) {
	const limit = 10;
	const offset = (page - 1) * limit;

	const tokens = q
		.toLowerCase()
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	const prefixQuery =
		tokens.length > 0
			? sql`to_tsquery('english', ${tokens.map(t => `${t}:*`).join(" & ")})`
			: null;

	return {
		limit,
		offset,
		plainQuery: sql`plainto_tsquery('english', ${q})`,
		tsQuery: sql`websearch_to_tsquery('english', ${q})`,
		prefixQuery,
		tsv: sql`to_tsvector('english', thread_title)`,
	};
}

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { ThreadRow } from "@/components/forum/ThreadRow";
import { PaginationControls } from "@/components/forum/PaginationControls";
import { getTopicColor } from "@/lib/utils/topicColor";
import type { ThreadListItem, Pagination } from "@/types/forum";
import { api } from "@/lib/api";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_LIMIT = 20;

export default function AllThreadsPage() {
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const [threads, setThreads] = useState<ThreadListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [sort, setSort] = useState<"latest" | "top" | "trending" | "views">(
		"latest",
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: PAGE_LIMIT,
		count: 0,
	});

	const fetchThreads = useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.getThreads({
				page: currentPage,
				limit: 20,
				sort,
				search: searchQuery,
			});
			setThreads(
				res.threads.map((t) => ({
					...t,
					title: (t.title || t.threadTitle || "Untitled") as string,
					topicColor: getTopicColor(t.topicId || ""),
				})),
			);
			setPagination(res.pagination);
		} catch (err) {
			toast.error("Error loading threads");
		} finally {
			setLoading(false);
		}
	}, [currentPage, sort, searchQuery]);

	useEffect(() => {
		const handler = setTimeout(fetchThreads, 300);
		return () => clearTimeout(handler);
	}, [fetchThreads]);

	const totalPages = Math.ceil(pagination.count / PAGE_LIMIT);

	if (!isAuthLoading && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<div className="site-container">
				<Breadcrumbs
					items={[{ label: "Home", href: "/home" }, { label: "All Threads" }]}
				/>
			</div>

			<main className="site-container flex-1 py-3">
				<div className="page-header mb-3">
					<span className="mono-label text-[9px] mb-1 block">{"// VIEW"}</span>
					<h1 className="font-black text-xl uppercase tracking-tight">
						All Threads
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-2 mb-3">
					<div className="relative flex-1 min-w-[200px]">
						<Search
							className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={14}
							strokeWidth={1.5}
						/>
						<Input
							className="pl-8 py-1 h-8 text-xs border"
							placeholder="Search..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<div className="flex gap-1">
						{(["latest", "top", "views", "trending"] as const).map((s) => (
							<Button
								key={s}
								variant={sort === s ? "default" : "neutral"}
								onClick={() => {
									setSort(s);
									setCurrentPage(1);
								}}
								className="capitalize font-bold text-[10px] py-1 px-2"
							>
								{s}
							</Button>
						))}
					</div>
				</div>

				<div className="border border-border space-y-0">
					<div className="border-b border-border px-3 py-2 bg-muted/30">
						<span className="font-black text-xs uppercase tracking-wider">
							Thread
						</span>
					</div>
					{loading ? (
						<p className="text-center py-4 font-bold text-sm">Loading...</p>
					) : threads.length === 0 ? (
						<p className="text-center py-4 font-bold text-sm">
							No threads found
						</p>
					) : (
						threads.map((t, idx) => (
							<div
								key={t.id}
								className={
									idx !== threads.length - 1 ? "border-b border-gray-200" : ""
								}
							>
								<ThreadRow thread={t} />
							</div>
						))
					)}
				</div>

				{totalPages > 1 && (
					<div className="mt-4">
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							loading={loading}
						/>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}

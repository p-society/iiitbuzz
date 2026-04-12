import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import { TopicThreadRow } from "@/components/forum/TopicThreadRow";
import type {
	TopicDetail,
	ThreadListItem,
	ThreadSortOption,
} from "@/types/forum";

export default function ThreadsPage() {
	const { topicId } = useParams<{ topicId: string }>();
	const [topic, setTopic] = useState<TopicDetail | null>(null);
	const [threads, setThreads] = useState<ThreadListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<ThreadSortOption>("latest");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		const loadData = async () => {
			if (!topicId) return;
			setLoading(true);
			try {
				const [topicData, threadsData] = await Promise.all([
					api.getTopicById(topicId),
					api.getThreadsByTopic(topicId, currentPage, 10, sortBy),
				]);
				setTopic(topicData.topic);
				setThreads(threadsData.threads);
				setTotalPages(Math.ceil(threadsData.pagination.count / 10));
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to load data";
				toast.error(message);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [topicId, currentPage, sortBy]);

	if (loading)
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<Loader />
				</main>
				<Footer />
			</div>
		);
	if (!topic)
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<p className="font-bold">Topic not found</p>
				</main>
				<Footer />
			</div>
		);

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<div className="site-container">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/home" },
						{ label: topic?.topicName || "Topic" },
					]}
				/>
			</div>

			<main className="site-container flex-1 py-3">
				<div className="topic-header mb-3 p-3 border-4 border-black bg-card">
					<h1 className="font-black text-xl">{topic?.topicName}</h1>
					<p className="text-xs text-muted-foreground">
						{topic?.topicDescription}
					</p>
				</div>

				<div className="action-bar flex justify-between items-center mb-3">
					<div className="flex gap-1">
						{(["latest", "top", "trending", "views"] as const).map((s) => (
							<Button
								key={s}
								variant={sortBy === s ? "default" : "neutral"}
								className="neo-brutal-button text-[10px] uppercase py-1 px-2"
								onClick={() => setSortBy(s)}
							>
								{s}
							</Button>
						))}
					</div>
					<Button asChild className="neo-brutal-button-strong py-1 px-2">
						<Link to="/new-thread" state={{ initialTopicId: topicId }}>
							<span className="text-xs">New Thread</span>
						</Link>
					</Button>
				</div>

				<div className="neo-brutal-card space-y-0 border-4 border-black">
					{threads.length === 0 ? (
						<p className="text-center py-4 font-bold text-sm">
							No threads here yet...
						</p>
					) : (
						threads.map((t, idx) => (
							<div
								key={t.id}
								className={
									idx !== threads.length - 1 ? "border-b-2 border-black" : ""
								}
							>
								<TopicThreadRow
									thread={t}
									topicName={topic?.topicName}
									topicColor={getTopicColor(topicId || "")}
								/>
							</div>
						))
					)}
				</div>

				{totalPages > 1 && (
					<div className="mt-4 flex justify-center gap-2">
						<Button
							type="button"
							variant="neutral"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="neo-brutal-button bg-card px-2 py-0.5 text-foreground disabled:opacity-50 text-[10px]"
						>
							Prev
						</Button>
						<span className="flex items-center font-bold text-[10px] text-foreground">
							{currentPage}/{totalPages}
						</span>
						<Button
							type="button"
							variant="neutral"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className="neo-brutal-button bg-card px-2 py-0.5 text-foreground disabled:opacity-50 text-[10px]"
						>
							Next
						</Button>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}

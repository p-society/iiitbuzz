import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";
import { TopicThreadRow } from "@/components/forum/TopicThreadRow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import { formatTimeAgo } from "@/lib/utils/date";
import type {
	Topic,
	RecentThread,
	ForumStats,
	ThreadListItem,
} from "@/types/forum";

export default function HomePage() {
	const [topics, setTopics] = useState<Topic[]>([]);
	const [recentThreads, setRecentThreads] = useState<RecentThread[]>([]);
	const [stats, setStats] = useState<ForumStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadPageData = async () => {
			try {
				const [topRes, thrRes, statRes] = await Promise.all([
					api.getTopics(),
					api.getThreads({ page: 1, limit: 5, sort: "latest" }),
					api.getStats(),
				]);
				const topicsWithCounts = await Promise.all(
					topRes.data.map(async (topic: Topic) => {
						try {
							const threadRes = await api.getThreadsByTopic(
								topic.id,
								1,
								1,
								"latest",
							);
							const latestThread = threadRes.threads[0];
							return {
								...topic,
								threadCount: threadRes.pagination.count,
								latestPost: latestThread
									? {
											title: (latestThread.threadTitle ||
												latestThread.title ||
												"Untitled") as string,
											authorInitials: (
												latestThread.author?.username ||
												latestThread.authorName ||
												"??"
											)
												.substring(0, 2)
												.toUpperCase(),
											timeAgo: formatTimeAgo(
												latestThread.lastActive || latestThread.createdAt || "",
											),
										}
									: undefined,
							};
						} catch {
							return { ...topic, threadCount: 0 };
						}
					}),
				);
				setTopics(topicsWithCounts);
				setStats(statRes.stats);
				setRecentThreads(
					thrRes.threads.map((t: ThreadListItem) => ({
						id: t.id,
						title: t.title || t.threadTitle || "Untitled",
						author: t.author?.username || t.authorName || "Anonymous",
						topic: t.topicName || "General",
						topicColor: getTopicColor(t.topicId || ""),
						replies: t.replies ?? 0,
						views: t.views ?? 0,
						lastActive: formatTimeAgo(t.lastActive || t.createdAt || ""),
					})),
				);
			} catch (err) {
				toast.error("Failed to sync with forum servers");
			} finally {
				setLoading(false);
			}
		};
		loadPageData();
	}, []);

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

	const officialTopics = topics.filter(
		(t) => t.category === "Official" || !t.category,
	);
	const hubTopics = topics.filter(
		(t) => t.category === "Hub" || t.category === "General",
	);

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<div className="site-container">
				<Breadcrumbs items={[{ label: "Home" }]} />
			</div>
			<main className="site-container flex-1 py-4">
				<div className="main-wrapper">
					<div className="primary-column space-y-4">
						{officialTopics.length > 0 && (
							<section>
								<div className="category-header mb-2">
									<h2 className="font-black text-lg">Official</h2>
								</div>
								<div className="neo-brutal-card space-y-0">
									{officialTopics.map((t, idx) => (
										<div
											key={t.id}
											className={
												idx !== officialTopics.length - 1
													? "border-b-2 border-black"
													: ""
											}
										>
											<TopicThreadRow
												topic={t}
												threadCount={t.threadCount || 0}
												latestPost={t.latestPost}
											/>
										</div>
									))}
								</div>
							</section>
						)}

						{hubTopics.length > 0 && (
							<section>
								<div className="category-header mb-2">
									<h2 className="font-black text-lg">The Hub</h2>
								</div>
								<div className="neo-brutal-card space-y-0">
									{hubTopics.map((t, idx) => (
										<div
											key={t.id}
											className={
												idx !== hubTopics.length - 1
													? "border-b-2 border-black"
													: ""
											}
										>
											<TopicThreadRow
												topic={t}
												threadCount={t.threadCount || 0}
												latestPost={t.latestPost}
											/>
										</div>
									))}
								</div>
							</section>
						)}
					</div>

					<aside className="sidebar">
						<div className="neo-brutal-card p-3">
							<h3 className="font-bold text-xs mb-2 uppercase tracking-wide border-b-2 border-black pb-1">
								Recent
							</h3>
							<div className="space-y-1.5 mb-3">
								{recentThreads.slice(0, 5).map((thread) => (
									<Link
										key={thread.id}
										to={`/thread/${thread.id}`}
										className="block hover:underline"
									>
										<div className="font-bold text-xs truncate">
											{thread.title}
										</div>
										<div className="text-[10px] text-muted-foreground">
											{thread.author} · {thread.lastActive}
										</div>
									</Link>
								))}
							</div>

							{stats && (
								<>
									<h3 className="font-bold text-xs mb-2 uppercase tracking-wide border-b-2 border-black pb-1">
										Stats
									</h3>
									<div className="grid grid-cols-2 gap-2">
										<div className="text-center">
											<div className="font-black text-base">
												{stats.totalThreads}
											</div>
											<div className="text-[10px] font-bold text-muted-foreground uppercase">
												Threads
											</div>
										</div>
										<div className="text-center">
											<div className="font-black text-base">
												{stats.totalPosts}
											</div>
											<div className="text-[10px] font-bold text-muted-foreground uppercase">
												Posts
											</div>
										</div>
										<div className="text-center">
											<div className="font-black text-base">
												{stats.totalMembers}
											</div>
											<div className="text-[10px] font-bold text-muted-foreground uppercase">
												Members
											</div>
										</div>
										<div className="text-center">
											<div className="font-black text-base">
												{stats.onlineMembers}
											</div>
											<div className="text-[10px] font-bold text-muted-foreground uppercase">
												Online
											</div>
										</div>
									</div>
								</>
							)}
						</div>

						<Button
							asChild
							className="neo-brutal-button-strong w-full py-1.5 mt-3"
						>
							<Link to="/threads" className="block text-center text-xs">
								All Threads
							</Link>
						</Button>
					</aside>
				</div>
			</main>
			<Footer />
		</div>
	);
}

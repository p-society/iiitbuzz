import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";
import { TopicCard } from "@/components/forum/TopicCard";
import { RecentThreadRow } from "@/components/forum/RecentThreadRow";
import { StatsGrid } from "@/components/forum/StatsGrid";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import { formatTimeAgo } from "@/lib/utils/date";
import type { Topic, RecentThread, ForumStats } from "@/types/forum";

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
                    api.getStats()
                ]);

                setTopics(topRes.data);
                setStats(statRes.stats);
                setRecentThreads(thrRes.threads.map((t: any) => ({
                    id: t.id,
                    title: t.title || t.threadTitle || "Untitled",
                    author: t.authorName || "Anonymous",
                    topic: t.topicName || "General",
                    topicColor: getTopicColor(t.topicId),
                    replies: t.replies || 0,
                    views: t.views || 0,
                    lastActive: formatTimeAgo(t.lastActive || t.createdAt),
                })));
            } catch (err) {
                toast.error("Failed to sync with forum servers");
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    if (loading) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader /></main><Footer /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
                <section className="mb-12">
                    <h2 className="mb-6 font-bold text-3xl">Topics</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map(t => <TopicCard key={t.id} topic={t} />)}
                    </div>
                </section>

                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-3xl">Recent Threads</h2>
                        <Button asChild className="neo-brutal-button-strong">
                            <Link to="/threads" className="text-primary">
                               View All &gt;
                            </Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {recentThreads.map(thread => <RecentThreadRow key={thread.id} thread={thread} />)}
                    </div>
                </section>

                {stats && <StatsGrid stats={stats} />}
            </main>
            <Footer />
        </div>
    );
}
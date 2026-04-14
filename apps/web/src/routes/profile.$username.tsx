import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { MapPin, Calendar, Settings, MessageSquare, Heart, FileText } from "lucide-react";
import { api, type ActivityItem } from "@/lib/api";
import { StatCard } from "@/components/profile/StatCard";
import type { UserProfile } from "@/types/user";
import { toast } from "sonner";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";
import { RecentThreadRow } from "@/components/forum/RecentThreadRow";
import type { RecentThread } from "@/types/forum";
import { getTopicColor } from "@/lib/utils/topicColor";
import { formatTimeAgo } from "@/lib/utils/date";

export default function UserProfilePage() {
    const { username } = useParams();
    const [data, setData] = useState<{ user: UserProfile, isOwn: boolean } | null>(null);
    const [userStats, setUserStats] = useState<{
        totalTopics: number;
        totalThreads: number;
    } | null>(null);
    const [recentThreads, setRecentThreads] = useState<RecentThread[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"threads" | "activity">("threads");

    useEffect(() => {
        if (!username) return;
        const fetchProfileAndStats = async () => {
            try {
                setLoading(true);
                const profileRes = await api.getUserProfile(username);
                setData({ user: profileRes.user, isOwn: profileRes.isOwnProfile });

                if (profileRes.user.id) {
                    const [statsRes, threadsRes, activityRes] = await Promise.all([
                        api.getUserStats(profileRes.user.id),
                        api.getUserThreads(profileRes.user.id, { page: 1, limit: 10, sort: 'latest' }),
                        api.getUserActivity(profileRes.user.id)
                    ]);

                    setUserStats(statsRes.stats);
                    setRecentThreads(threadsRes.threads.map((t: any) => ({
                        id: t.id,
                        title: t.threadTitle || "Untitled", 
                        author: t.authorName || profileRes.user.username || "Anonymous",
                        topic: t.topicName || "General",
                        topicColor: getTopicColor(t.topicId),
                        replies: t.replies || 0,
                        views: t.viewCount || 0, 
                        lastActive: formatTimeAgo(t.createdAt),
                    })));
                    setActivity(activityRes.activity);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndStats();
    }, [username]);

    if (loading) return <div className="min-h-screen flex flex-col"><Header /><Loader /><Footer /></div>;
    if (!data) return <div className="p-20 text-center font-bold">User Not Found</div>;

    const { user, isOwn } = data;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-8 flex-1 w-full">
                <div className="grid gap-6 lg:grid-cols-3">
                    <aside className="space-y-6">
                        <div className="border-4 border-border bg-card p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <div className="mb-4 flex justify-between">
                                <div className="h-20 w-20 flex items-center justify-center border-4 border-border bg-primary overflow-hidden">
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} alt={user.username} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-4xl text-primary-foreground">
                                            {(user.username?.[0] || "U").toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                {isOwn && (
                                    <Link to="/my/profile">
                                        <button type="button" className="flex h-10 w-10 items-center justify-center border-3 border-border bg-card shadow-[3px_3px_0px_0px_var(--shadow-color)] transition-all hover:translate-x-[1px] hover:translate-y-[1px]">
                                            <Settings className="h-5 w-5" />
                                        </button>
                                    </Link>
                                )}
                            </div>
                            <h1 className="text-2xl font-black uppercase">{user.username}</h1>
                            <div className="my-2 bg-accent border-2 border-border px-3 py-1 inline-block font-bold text-xs uppercase">Member</div>
                            <p className="text-muted-foreground font-bold text-sm mb-4">{user.bio || "No bio yet."}</p>
                            <div className="space-y-2 font-bold text-sm">
                                <div className="flex items-center gap-2"><MapPin size={16} /> {user.branch || "Unknown Dept"}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} /> Batch of {user.passingOutYear || "N/A"}</div>
                            </div>
                        </div>

                        <div className="border-4 border-border bg-card p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <h2 className="mb-4 font-black text-xl uppercase">Statistics</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard label="Posts" value={user?.totalPosts ?? 0} color="primary" />
                                <StatCard label="Threads" value={userStats?.totalThreads ?? 0} color="secondary" />
                                <StatCard label="Likes" value={0} color="accent" />
                                <StatCard label="Solved" value={0} color="muted" />
                            </div>
                        </div>
                    </aside>

                    <section className="lg:col-span-2">
                        <div className="flex gap-2 mb-6">
                            {["threads", "activity"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`border-4 border-border px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all ${activeTab === tab ? "bg-foreground text-background" : "bg-card"}`}
                                >
                                    {tab === "threads" ? "Recent Threads" : "Activity"}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {activeTab === "threads" ? (
                                <div className="space-y-4">
                                    {recentThreads.length > 0 ? (
                                        recentThreads.map((thread) => (
                                            <RecentThreadRow key={thread.id} thread={thread} />
                                        ))
                                    ) : (
                                        <p className="text-center py-10 font-bold border-4 border-dashed border-border text-muted-foreground">
                                            No Recent Threads
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activity.length > 0 ? (
                                        activity.map((item) => (
                                            <div key={`${item.type}-${item.id}`} className="flex items-start gap-4 border-4 border-border bg-card p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                                                <div className={`p-2 border-2 border-border ${
                                                    item.type === 'thread' ? 'bg-blue-100' : 
                                                    item.type === 'post' ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    {item.type === 'thread' && <FileText className="h-4 w-4 text-blue-600" />}
                                                    {item.type === 'post' && <MessageSquare className="h-4 w-4 text-green-600" />}
                                                    {item.type === 'like' && <Heart className="h-4 w-4 text-red-600" fill="currentColor" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                            {item.type === 'thread' ? 'New Thread' : 
                                                             item.type === 'post' ? 'Replied to' : 'Liked'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-muted-foreground">
                                                            {formatTimeAgo(item.createdAt)}
                                                        </span>
                                                    </div>
                                                    <Link 
                                                        to={item.threadId ? `/thread/${item.threadId}` : `/thread/${item.id}`}
                                                        className="block font-black text-sm hover:underline truncate"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    {item.content && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                                                            "{item.content}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-10 font-bold border-4 border-dashed border-border text-muted-foreground">
                                            No Activity Yet
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
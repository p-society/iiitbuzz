import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {  MapPin, Calendar, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/profile/StatCard";
import { ThreadRow } from "@/components/forum/ThreadRow"; // we will use this when we return real threads created by the user
import type { UserProfile } from "@/types/user";
import { toast } from "sonner";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";

export default function UserProfilePage() {
    const { username } = useParams();
    const [data, setData] = useState<{user: UserProfile, isOwn: boolean} | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"threads" | "activity">("threads");

    useEffect(() => {
        if (!username) return;
        api.getUserProfile(username)
            .then(res => setData({ user: res.user, isOwn: res.isOwnProfile }))
            .catch(err => toast.error(err.message))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <div className="min-h-screen flex flex-col"><Header /><Loader /><Footer /></div>;
    if (!data) return <div className="p-20 text-center font-bold">User Not Found</div>;

    const { user, isOwn } = data;
    const avatar = (user.username?.[0] || "U").toUpperCase();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-8 flex-1 w-full">
                

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Sidebar */}
                    <aside className="space-y-6">
                        <div className="border-4 border-border bg-card p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <div className="mb-4 flex justify-between">
                                <div className="h-20 w-20 flex items-center justify-center border-4 border-border bg-primary font-bold text-4xl text-primary-foreground">
                                    {avatar}
                                </div>
                                {isOwn && (
                                    <Link to="/my/profile">
                                        <button
                                            type="button"
                                           
                                            className="flex h-10 w-10 aspect-square items-center justify-center border-3 border-border bg-card shadow-[3px_3px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                            aria-label="Edit Profile"
                                        >
                                            <Settings className="h-5 w-5" />
                                        </button>
                                    </Link>
                                )}
                            </div>
                            <h1 className="text-2xl font-black   uppercase">{user.username}</h1>
                            <div className="my-2 bg-accent border-2 border-border px-3 py-1 inline-block font-bold text-xs uppercase">Member</div>
                            <p className="text-muted-foreground font-bold text-sm mb-4">{user.bio || "No bio yet."}</p>
                            <div className="space-y-2 font-bold text-sm">
                                <div className="flex items-center gap-2"><MapPin size={16} /> {user.branch || "Unknown Dept"}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} /> Joined recently</div>
                            </div>
                        </div>

                        <div className="border-4 border-border bg-card p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <h2 className="mb-4 font-black text-xl uppercase  ">Statistics</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard label="Posts" value={user.totalPosts} color="primary" />
                                <StatCard label="Threads" value={0} color="secondary" />
                                <StatCard label="Likes" value={0} color="accent" />
                                <StatCard label="Solved" value={0} color="muted" />
                            </div>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <section className="lg:col-span-2">
                        <div className="flex gap-2 mb-6">
                            {["threads", "activity"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`border-4 border-border px-6 py-2 font-black uppercase   shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all ${
                                        activeTab === tab ? "bg-foreground text-background" : "bg-card"
                                    }`}
                                >
                                    {tab === "threads" ? "Recent Threads" : "Activity"}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {activeTab === "threads" ? (
                                <p className="text-center py-10 font-bold border-4 border-dashed border-border">No threads yet.</p>
                            ) : (
                                <p className="text-center py-10 font-bold border-4 border-dashed border-border">No activity yet.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
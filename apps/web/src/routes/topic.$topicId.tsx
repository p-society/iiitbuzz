import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useParams} from "react-router-dom";


import { api } from "@/lib/api";
import { TopicThreadRow } from "@/components/forum/TopicThreadRow";
import type { TopicDetail, Thread, ThreadSortOption } from "@/types/forum";


const getTopicPresentation = (id: string) => {
    // This is a MOCK logic to assign an icon and color based on the ID for styling
    const colors = ["bg-yellow-400", "bg-green-400", "bg-red-400", "bg-blue-400"];
    const icons = ["💬", "🛠️", "❓", "📢"];
    const hash = id.length % 4;
    return {
        colorClass: colors[hash % colors.length],
        icon: icons[hash % icons.length],
    };
};



export default function ThreadsPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const [topic, setTopic] = useState<TopicDetail | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
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
                    api.getThreadsByTopic(topicId, currentPage, 10, sortBy)
                ]);
                setTopic(topicData.topic);
                setThreads(threadsData.threads);
                setTotalPages(Math.ceil(threadsData.pagination.count / 10));
            } catch (err: any) {
                toast.error(err.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [topicId, currentPage, sortBy]);

    if (loading) return (
    <div className="p-20 text-center">
        <Header/>
        <Loader />
    </div>
    );
    if (!topic) return <div className="p-20 text-center font-bold">Topic not found</div>;
    
    
    

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <header className="neo-brutal-header p-6 bg-card border-b-4 border-black">
                <div className="max-w-7xl mx-auto">
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-black uppercase ">{topic.topicName}</h1>
                            <p className="text-muted-foreground font-bold">{topic.topicDescription}</p>
                        </div>
                        {/* <Button asChild variant="neutral" className="neo-brutal-button-strong">
                            <Link to="/new-thread" state={{ initialTopicId: topicId }}>New Thread</Link>
                        </Button> */}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 flex-1 w-full">
                <div className="flex gap-2 mb-6">
                    {(["latest", "top", "trending", "views"] as const).map((s) => (
                        <Button 
                            key={s} 
                            variant={sortBy === s ? "default" : "neutral"}
                            className="neo-brutal-button text-xs uppercase"
                            onClick={() => setSortBy(s)}
                        >
                            {s}
                        </Button>
                    ))}
                </div>

                <div className="space-y-4">
                    {threads.map(t => <TopicThreadRow key={t.id} thread={t} />)}
                    {threads.length === 0 && <p className="text-center py-10 font-bold">No threads here yet...</p>}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-4">
                        <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="neo-brutal-button bg-card px-4 py-2 text-foreground disabled:opacity-50"
                        >
                            Previous
                        </Button>
                        <span className="flex items-center font-bold text-sm text-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="neo-brutal-button bg-card px-4 py-2 text-foreground disabled:opacity-50"
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
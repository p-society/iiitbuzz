import { useState, useEffect } from "react";
import {  Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { ThreadRow } from "@/components/forum/ThreadRow";
import { PaginationControls } from "@/components/forum/PaginationControls";
import { getTopicColor } from "@/lib/utils/topicColor";
import type { ThreadListItem, Pagination } from "@/types/forum";
import { api } from "@/lib/api";
import Header from "@/components/ui/header";

const PAGE_LIMIT = 20;

export default function AllThreadsPage() {
    const [threads, setThreads] = useState<ThreadListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<"latest" | "top" | "trending" | "views">("latest");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_LIMIT, count: 0 });

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const res = await api.getThreads({ page: currentPage, limit: 20, sort, search: searchQuery });
            setThreads(res.threads.map(t => ({
                ...t,
                title: t.title || t.threadTitle,
                topicColor: getTopicColor(t.topicId)
            })));
            setPagination(res.pagination);
        } catch (err) {
            toast.error("Error loading threads");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(fetchThreads, 300);
        return () => clearTimeout(handler);
    }, [currentPage, sort, searchQuery]);

    const totalPages = Math.ceil(pagination.count / PAGE_LIMIT);

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <header className="neo-brutal-header p-3 bg-background">
                <div className="mx-auto max-w-7xl">
                    
                    <div className="flex justify-between items-end">
                        <h1 className="font-bold text-3xl">All Threads</h1>
                        
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col gap-4 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input 
                            className="neo-brutal-input pl-12" 
                            placeholder="Search threads..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="font-bold text-sm">Sort:</span>
                        {["latest", "top", "views", "trending"].map((s: any) => (
                            <Button 
                                key={s} 
                                variant={sort === s ? "default" : "neutral"} 
                                onClick={() => { setSort(s); setCurrentPage(1); }}
                                className="neo-brutal-button capitalize font-bold text-xs"
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? <p className="text-center font-bold">Loading...</p> : 
                     threads.map(t => <ThreadRow key={t.id} thread={t} />)}
                </div>

                <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                    loading={loading} 
                />
            </main>
        </div>
    );
}
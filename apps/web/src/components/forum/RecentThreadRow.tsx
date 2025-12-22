import { Link } from "react-router";
import { MessageSquare, Eye } from "lucide-react";
import type { RecentThread } from "@/types/forum";

export const RecentThreadRow = ({ thread }: { thread: RecentThread }) => {
    return (
        <Link to={`/thread/${thread.id}`} className="block">
            <div className="neo-brutal-card p-4 sm:p-5 hover:translate-x-1 hover:-translate-y-1 transition-transform">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="mb-2 font-bold text-lg sm:text-xl leading-tight truncate">
                            {thread.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span className="font-bold">{thread.author}</span>
                            <span className={`rounded border-2 border-border ${thread.topicColor} px-2 py-0.5 font-bold text-xs text-black`}>
                                {thread.topic}
                            </span>
                            <span className="text-muted-foreground">
                                {thread.lastActive}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-bold sm:shrink-0">
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            {thread.replies}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            {thread.views}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
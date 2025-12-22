import { Link } from "react-router";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Thread } from "@/types/forum";

export const TopicThreadRow = ({ thread }: { thread: Thread }) => (
    <Link to={`/thread/${thread.id}`} className="block">
        <div className="neo-brutal-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-shrink-0 self-start">
                    <div className="neo-brutal-avatar h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base bg-primary border-2 border-black flex items-center justify-center font-bold">
                        {(thread.author?.username || '??').substring(0, 2).toUpperCase()}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        {thread.isPinned && <Badge className="bg-accent text-accent-foreground border-2 border-black">PINNED</Badge>}
                        <h3 className="flex-1 font-bold text-base sm:text-xl leading-tight">{thread.threadTitle}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
                        <span className="text-primary">By {thread.author?.username || 'Unknown'}</span>
                        <span className="text-muted-foreground">
                            {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-black sm:flex-shrink-0">
                    <span className="flex items-center gap-1"><MessageSquare size={16} />{thread.replyCount || 0}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Eye size={16} />{thread.viewCount || 0}</span>
                    <span className="flex items-center gap-1 text-primary"><ThumbsUp size={16} />{thread.likes || 0}</span>
                </div>
            </div>
        </div>
    </Link>
);
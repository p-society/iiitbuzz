import { Link } from "react-router-dom";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ThreadListItem } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";

export const ThreadRow = ({ thread }: { thread: ThreadListItem }) => {
    const avatarInitials = thread.authorName.substring(0, 2).toUpperCase();

    return (
        <Link to={`/thread/${thread.id}`} className="block">
            <div className="neo-brutal-card p-4 sm:p-5 hover:translate-x-1 hover:-translate-y-1 transition-transform">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0 self-start">
                        <div className="neo-brutal-avatar h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base border-2">
                            {avatarInitials}
                        </div>
                    </div>

                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {thread.isPinned && (
                                <Badge className="bg-accent text-accent-foreground border-2 border-black font-bold">
                                    PINNED
                                </Badge>
                            )}
                            <span className={`rounded border-2 border-black ${thread.topicColor} px-2 py-0.5 font-bold text-[10px] sm:text-xs text-black uppercase`}>
                                {thread.topicName}
                            </span>
                        </div>
                        <h3 className="mb-2 font-bold text-base sm:text-xl leading-tight truncate">{thread.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className="font-bold">{thread.authorName}</span>
                            <span className="text-muted-foreground">Last active {formatTimeAgo(thread.lastActive)}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold sm:flex-shrink-0">
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            {thread.replies}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            {thread.views}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            {thread.likes}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
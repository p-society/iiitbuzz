import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { PostDetail } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";

interface PostItemProps {
    post: PostDetail;
    index: number;
    isOP: boolean;
}

export const PostItem = ({ post, index, isOP }: PostItemProps) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (!post.authorName) return;
        api.getUserProfile(post.authorName)
            .then((res) => {
                if (res.success && res.user.imageUrl) {
                    setAvatarUrl(res.user.imageUrl.replace("http://", "https://"));
                }
            })
            .catch(() => setImgError(true));
    }, [post.authorName]);

    return (
        <div className="neo-brutal-card">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 sm:w-40 sm:flex-shrink-0">
                    <div className="neo-brutal-avatar h-12 w-12 sm:h-20 sm:w-20 text-lg sm:text-2xl flex-shrink-0 border-4 overflow-hidden flex items-center justify-center">
                        {!imgError && avatarUrl ? (
                            <img 
                                src={avatarUrl} 
                                alt={post.authorName} 
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            post.authorAvatar
                        )}
                    </div>
                    <div className="flex-1 sm:flex-initial sm:w-full">
                        <div className="font-bold text-base sm:text-lg text-foreground truncate">{post.authorName}</div>
                        {isOP && (
                            <Badge className=" mt-1 bg-accent text-accent-foreground inline-block sm:block">
                                A Badge
                            </Badge>
                        )}
                        <div className="hidden sm:block mt-2 text-muted-foreground text-sm">
                            <div>Member</div> 
                            <div className="mt-1">{post.postCount || 1} posts</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between border-b-2 border-border pb-2 sm:pb-3">
                        <span className="font-bold text-muted-foreground text-xs sm:text-sm">#{index + 1}</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="mb-3 sm:mb-4 text-sm sm:text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <Button size="sm" className="neo-brutal-button border-2 bg-accent px-2 py-1 font-bold text-xs text-accent-foreground">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            {post.likes}
                        </Button>
                        <Button size="sm" variant="neutral" className="neo-brutal-button border-2 bg-card px-2 py-1 font-bold text-xs">
                            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button size="sm" variant="neutral" className="neo-brutal-button border-2 bg-card px-2 py-1 font-bold text-xs">
                            Reply
                        </Button>
                        <Button size="sm" variant="neutral" className="neo-brutal-button ml-auto border-2 bg-card px-2 py-1 font-bold text-xs">
                            <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
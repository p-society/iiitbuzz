import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Flag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/ui/markdown";
import { api } from "@/lib/api";
import type { PostDetail } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";

interface PostItemProps {
	post: PostDetail;
	index: number;
	isOP: boolean;
	onQuote?: () => void;
}

export const PostItem = ({ post, index, isOP, onQuote }: PostItemProps) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [imgError, setImgError] = useState(false);
	const [voteValue, setVoteValue] = useState(0);
	const [voteCount, setVoteCount] = useState(post.likes);
	const [voting, setVoting] = useState(false);

	useEffect(() => {
		if (!post.authorName) return;
		api
			.getUserProfile(post.authorName)
			.then((res) => {
				if (res.success && res.user.imageUrl) {
					setAvatarUrl(res.user.imageUrl.replace("http://", "https://"));
				}
			})
			.catch(() => setImgError(true));
	}, [post.authorName]);

	useEffect(() => {
		api
			.getPostVote(post.postId)
			.then((res) => {
				if (res.success) setVoteValue(res.vote);
			})
			.catch(() => {});
	}, [post.postId]);

	const handleVote = useCallback(
		async (value: number) => {
			if (voting) return;
			setVoting(true);
			try {
				const res = await api.voteOnPost(post.postId, value);
				if (res.success) {
					setVoteValue(res.voted ? res.value : 0);
					setVoteCount((prev) => {
						if (res.voted) {
							if (voteValue === value) return prev;
							if (voteValue !== 0) return prev + value * 2;
							return prev + value;
						}
						return prev - value;
					});
				}
			} catch {
			} finally {
				setVoting(false);
			}
		},
		[voting, post.postId, voteValue],
	);

	return (
		<div className="border border-black bg-card">
			<div className="post-block flex flex-col sm:flex-row">
				<div className="author-pane w-full sm:w-[140px] p-2 sm:p-3 flex-shrink-0">
					<div className="h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base mb-2 overflow-hidden flex items-center justify-center bg-foreground text-background font-bold border border-black text-[10px]">
						{!imgError && avatarUrl ? (
							<img
								src={avatarUrl}
								alt={post.authorName}
								className="h-full w-full object-cover"
								referrerPolicy="no-referrer"
								onError={() => setImgError(true)}
							/>
						) : (
							<span>{post.authorAvatar}</span>
						)}
					</div>
					<div className="font-bold text-xs truncate">{post.authorName}</div>
					{isOP && <span className="tech-stamp mt-1 text-[8px]">OP</span>}
					<div className="mt-2 mono-meta">{post.postCount || 1} posts</div>
				</div>
				<div className="content-pane flex-1 min-w-0 p-2 sm:p-3">
					<div className="post-meta flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
						<span className="mono-meta">#{index + 1}</span>
						<span className="mono-meta">
							[ {formatTimeAgo(post.createdAt).toUpperCase()} ]
						</span>
					</div>
					<div className="post-body mb-3" style={{ lineHeight: 1.6 }}>
						<MarkdownContent content={post.content} />
					</div>
					<div className="post-actions flex items-center gap-1.5">
						<Button
							size="sm"
							onClick={() => handleVote(1)}
							disabled={voting}
							className={`px-1.5 py-0.5 font-bold text-[10px] ${voteValue === 1 ? "bg-primary text-primary-foreground" : ""}`}
						>
							<ThumbsUp className="h-3 w-3 mr-1" />
							{voteCount}
						</Button>
						<Button
							size="sm"
							variant="neutral"
							onClick={() => handleVote(-1)}
							disabled={voting}
							className={`bg-card px-1.5 py-0.5 font-bold text-[10px] ${voteValue === -1 ? "text-red-500" : ""}`}
						>
							<ThumbsDown className="h-3 w-3" />
						</Button>
						<Button
							size="sm"
							variant="neutral"
							className="bg-card px-1.5 py-0.5 font-bold text-[10px]"
							onClick={onQuote}
						>
							<MessageSquare className="h-3 w-3 mr-1" />
							Quote
						</Button>
						<Button
							size="sm"
							variant="neutral"
							className="bg-card px-1.5 py-0.5 font-bold text-[10px] ml-auto"
						>
							<Flag className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Flag, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/ui/markdown";
import { api } from "@/lib/api";
import type { PostDetail } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface PostItemProps {
	post: PostDetail;
	index: number;
	isOP: boolean;
	onQuote?: () => void;
	canDelete?: boolean;
	onDelete?: () => Promise<void>;
}

export const PostItem = ({
	post,
	index,
	isOP,
	onQuote,
	canDelete = false,
	onDelete,
}: PostItemProps) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [imgError, setImgError] = useState(false);
	const [voteValue, setVoteValue] = useState(0);
	const [voteCount, setVoteCount] = useState(post.likes);
	const [voting, setVoting] = useState(false);
	const [reporting, setReporting] = useState(false);
	const [hasReported, setHasReported] = useState(false);
	const profileUsername = !post.isAnonymous ? post.authorName : null;

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

	useEffect(() => {
		api
			.getPostReportStatus(post.postId)
			.then((res) => {
				if (res.success) {
					setHasReported(res.alreadyReported);
				}
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
					{profileUsername ? (
						<Link
							to={`/profile/${encodeURIComponent(profileUsername)}`}
							className="block h-10 w-10 sm:h-12 sm:w-12 mb-2"
						>
							<div className="h-full w-full text-sm sm:text-base overflow-hidden flex items-center justify-center bg-foreground text-background font-bold border border-black text-[10px] hover:opacity-85 transition-opacity">
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
						</Link>
					) : (
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
					)}
					<div className="font-bold text-xs truncate">
						{profileUsername ? (
							<Link
								to={`/profile/${encodeURIComponent(profileUsername)}`}
								className="hover:underline"
							>
								{post.authorName}
							</Link>
						) : (
							"Anonymous"
						)}
					</div>
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
					<div className="post-actions flex flex-wrap items-center gap-1.5">
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
						{canDelete && onDelete && (
							<Button
								size="sm"
								variant="neutral"
								className="bg-card px-1.5 py-0.5 font-bold text-[10px] text-red-600"
								onClick={() => {
									void onDelete();
								}}
							>
								<Trash2 className="h-3 w-3 mr-1" />
								Delete
							</Button>
						)}
						<Button
							size="sm"
							variant="neutral"
							className={`px-1.5 py-0.5 font-bold text-[10px] ml-auto transition-colors ${hasReported ? "text-red-600 border-red-600" : "bg-card"}`}
							disabled={reporting}
							onClick={async () => {
								if (reporting) return;
								if (hasReported) {
									toast.success("Post already reported");
									return;
								}
								setReporting(true);
								try {
									const res = await api.reportPost(post.postId);
									if (res.alreadyReported) {
										setHasReported(true);
										toast.success("Post already reported");
										return;
									}
									setHasReported(true);
									toast.success("Post reported to admins");
								} catch (err) {
									const message =
										err instanceof Error ? err.message : "Failed to report post";
									toast.error(message);
								} finally {
									setReporting(false);
								}
							}}
						>
							<Flag className={`h-3 w-3 ${hasReported ? "fill-current text-red-600" : ""}`} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { Share2, Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { toast } from "sonner";
import { PostItem } from "@/components/forum/PostItem";
import { ReplyBox } from "@/components/forum/ReplyBox";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import { formatDateIST } from "@/lib/utils/date";
import type { ThreadDetail, PostDetail } from "@/types/forum";
import { useAuth } from "@/contexts/AuthContext";

export default function ThreadPage() {
	const { threadId } = useParams<{ threadId: string }>();
	const navigate = useNavigate();
	const { user, isAdmin, isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const [thread, setThread] = useState<ThreadDetail | null>(null);
	const [posts, setPosts] = useState<PostDetail[]>([]);
	const [loading, setLoading] = useState(true);
	const [replyContent, setReplyContent] = useState("");
	const [replyAnonymous, setReplyAnonymous] = useState(false);
	const [submittingReply, setSubmittingReply] = useState(false);
	const [postError, setPostError] = useState<string | null>(null);
	const [replyTo, setReplyTo] = useState<{
		author: string;
		content: string;
	} | null>(null);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [bookmarkLoading, setBookmarkLoading] = useState(false);
	const replyContentRef = useRef<HTMLTextAreaElement>(null);

	if (!isAuthLoading && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	const loadThreadData = useCallback(async () => {
		if (!threadId) return;
		try {
			const [tRes, pRes] = await Promise.all([
				api.getThreadById(threadId),
				api.getPostsByThreadId(threadId),
			]);

			setThread({
				...tRes.thread,
				title: tRes.thread.threadTitle,
				authorId: tRes.thread.createdBy,
				topicColor: getTopicColor(tRes.thread.topicId),
			});
			setPosts(
				pRes.posts.map((p) => ({
					...p,
					authorAvatar: p.authorName.substring(0, 2).toUpperCase(),
				})),
			);
		} catch (err) {
			toast.error("Thread not found");
		} finally {
			setLoading(false);
		}
	}, [threadId]);

	useEffect(() => {
		if (!threadId || !user) return;
		api
			.getThreadBookmarkStatus(threadId)
			.then((res) => setIsBookmarked(res.isBookmarked))
			.catch(() => {});
	}, [threadId, user]);

	useEffect(() => {
		loadThreadData();
	}, [loadThreadData]);

	const handlePostReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyContent.trim() || !threadId) return;

		setSubmittingReply(true);
		setPostError(null);

		try {
			await api.createPost({
				threadId,
				content: replyContent,
				isAnonymous: replyAnonymous,
			});
			setReplyContent("");
			if (replyAnonymous) {
				toast.success("Reply submitted! It will appear after admin approval.");
			}
			setReplyAnonymous(true);
			await loadThreadData();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to post reply";
			setPostError(message);
			toast.error("Wait, something went wrong.");
		} finally {
			setSubmittingReply(false);
		}
	};

	const handleContentChange = (val: string) => {
		setReplyContent(val);
		if (postError) setPostError(null);
	};

	const handleQuote = (author: string, content: string) => {
		setReplyTo({ author, content });
		setTimeout(() => {
			replyContentRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			replyContentRef.current?.focus();
		}, 100);
	};

	const handleFormatting = (syntax: string) => {
		const el = replyContentRef.current;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const text = el.value;
		const newText =
			text.substring(0, start) +
			syntax +
			text.substring(start, end) +
			syntax +
			text.substring(end);
		setReplyContent(newText);
	};

	const handleShare = () => {
		const url = window.location.href;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				toast.success("Link copied to clipboard!");
			})
			.catch(() => {
				toast.error("Failed to copy link.");
			});
	};

	const handleBookmarkToggle = async () => {
		if (!threadId) return;
		if (!user) {
			toast.error("Please log in to bookmark threads");
			return;
		}
		if (bookmarkLoading) return;

		const previousBookmarked = isBookmarked;
		const nextBookmarked = !previousBookmarked;
		setIsBookmarked(nextBookmarked);
		setBookmarkLoading(true);
		try {
			if (previousBookmarked) {
				await api.removeThreadBookmark(threadId);
				toast.success("Bookmark removed");
			} else {
				await api.addThreadBookmark(threadId);
				toast.success("Thread bookmarked");
			}
		} catch (err) {
			setIsBookmarked(previousBookmarked);
			const message =
				err instanceof Error ? err.message : "Failed to update bookmark";
			toast.error(message);
		} finally {
			setBookmarkLoading(false);
		}
	};

	const handleDeleteThread = async () => {
		if (!threadId) return;

		try {
			await api.deleteThread(threadId);
			toast.success("Thread deleted");
			navigate("/threads");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to delete thread";
			toast.error(message);
		}
	};

	const handleDeletePost = async (postId: string) => {
		try {
			await api.deletePost(postId);
			toast.success("Post deleted");
			await loadThreadData();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to delete post";
			toast.error(message);
		}
	};

	if (loading || !thread)
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<p className="font-bold">Loading...</p>
				</main>
				<Footer />
			</div>
		);

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<div className="site-container">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/home" },
						{ label: thread.topicName, href: `/topic/${thread.topicId}` },
						{ label: thread.title },
					]}
				/>
			</div>

			<main className="site-container flex-1 py-3">
				{thread && (isAdmin || thread.authorId === user?.id) && (
					<div className="mb-2 flex justify-end">
						<Button
							variant="neutral"
							size="sm"
							className="text-red-600 border-red-600"
							onClick={handleDeleteThread}
						>
							<Trash2 className="h-3.5 w-3.5 mr-1" />
							Delete Thread
						</Button>
					</div>
				)}

				<div className="flex justify-between items-start mb-3">
					<div className="flex-1">
						<span className="mono-label text-[9px] mb-1 block">
							{"// THREAD"}
						</span>
						<h1 className="text-lg font-black uppercase tracking-tight">
							{thread.title}
						</h1>
						<p className="mono-meta">
							by{" "}
							{thread.isAnonymous ? (
								<span className="font-bold text-foreground">{thread.authorName}</span>
							) : (
								<Link
									to={`/profile/${encodeURIComponent(thread.authorName)}`}
									className="font-bold text-foreground hover:underline"
								>
									{thread.authorName}
								</Link>
							)}{" "}
							· {formatDateIST(thread.createdAt)}
						</p>
					</div>
					<div className="flex gap-1">
						<Button
							variant="neutral"
							size="icon"
							className={`h-7 w-7 ${isBookmarked ? "bg-primary text-primary-foreground" : ""}`}
							onClick={handleBookmarkToggle}
							disabled={bookmarkLoading}
							aria-label={isBookmarked ? "Remove bookmark" : "Bookmark thread"}
							title={isBookmarked ? "Remove bookmark" : "Bookmark thread"}
						>
							<Bookmark
								className="h-3 w-3"
								strokeWidth={1.5}
								fill={isBookmarked ? "currentColor" : "none"}
							/>
						</Button>
						<Button
							variant="neutral"
							size="icon"
							className="h-7 w-7"
							onClick={handleShare}
							aria-label="Share thread"
							title="Share thread"
						>
							<Share2 className="h-3 w-3" strokeWidth={1.5} />
						</Button>
					</div>
				</div>

				<div className="space-y-3 animate-fade-in">
					{posts.map((post, i) => (
						<PostItem
							key={post.postId}
							post={post}
							index={i}
							isOP={post.authorId === thread.authorId}
							onQuote={() => handleQuote(post.authorName, post.content)}
							canDelete={Boolean(isAdmin || post.authorId === user?.id)}
							onDelete={() => handleDeletePost(post.postId)}
						/>
					))}
				</div>

				<div className="mt-4">
					<ReplyBox
						content={replyContent}
						setContent={handleContentChange}
						onSubmit={handlePostReply}
						submitting={submittingReply}
						onFormat={handleFormatting}
						textareaRef={replyContentRef}
						error={postError}
						replyTo={replyTo}
						onClearReplyTo={() => setReplyTo(null)}
						threadId={threadId || ""}
						useDraft
						onReload={loadThreadData}
						isThreadAnonymous={thread?.isAnonymous}
						isAnonymous={replyAnonymous}
						onAnonymousChange={setReplyAnonymous}
					/>
				</div>
			</main>
			<Footer />
		</div>
	);
}

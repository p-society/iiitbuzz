import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { toast } from "sonner";
import { PostItem } from "@/components/forum/PostItem";
import { ReplyBox } from "@/components/forum/ReplyBox";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import type { ThreadDetail, PostDetail } from "@/types/forum";

export default function ThreadPage() {
	const { threadId } = useParams<{ threadId: string }>();
	const [thread, setThread] = useState<ThreadDetail | null>(null);
	const [posts, setPosts] = useState<PostDetail[]>([]);
	const [loading, setLoading] = useState(true);
	const [replyContent, setReplyContent] = useState("");
	const [submittingReply, setSubmittingReply] = useState(false);
	const [postError, setPostError] = useState<string | null>(null);
	const [replyTo, setReplyTo] = useState<{
		author: string;
		content: string;
	} | null>(null);
	const replyContentRef = useRef<HTMLTextAreaElement>(null);

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
		loadThreadData();
	}, [loadThreadData]);

	const handlePostReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyContent.trim() || !threadId) return;

		setSubmittingReply(true);
		setPostError(null);

		try {
			await api.createPost({ threadId, content: replyContent });
			setReplyContent("");
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
		navigator.clipboard.writeText(url).then(() => {
			toast.success("Link copied to clipboard!");
		}).catch(() => {
			toast.error("Failed to copy link.");
		});
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
							<span className="font-bold text-foreground">
								{thread.authorName}
							</span>{" "}
							· {new Date(thread.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div className="flex gap-1">
						<Button variant="neutral" size="icon" className="h-7 w-7">
							<Bookmark className="h-3 w-3" strokeWidth={1.5} />
						</Button>
						<Button 
							variant="neutral" 
							size="icon" 
							className="h-7 w-7"
							onClick={handleShare}
						>
							<Share2 className="h-3 w-3" strokeWidth={1.5} />
						</Button>
					</div>
				</div>

				<div className="space-y-3">
					{posts.map((post, i) => (
						<PostItem
							key={post.postId}
							post={post}
							index={i}
							isOP={post.authorId === thread.authorId}
							onQuote={() =>
								setReplyTo({ author: post.authorName, content: post.content })
							}
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
					/>
				</div>
			</main>
			<Footer />
		</div>
	);
}

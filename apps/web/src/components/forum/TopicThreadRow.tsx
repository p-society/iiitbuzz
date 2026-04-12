import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { ThreadListItem, Topic } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";
import { getTopicColor } from "@/lib/utils/topicColor";

interface TopicRowProps {
	topic: Topic;
	threadCount: number;
	latestPost?: {
		title: string;
		authorInitials: string;
		timeAgo: string;
	};
}

interface ThreadRowProps {
	thread: ThreadListItem;
	topicName?: string;
	topicColor?: string;
}

const TopicRow = ({ topic, threadCount, latestPost }: TopicRowProps) => {
	const isRead = false;

	return (
		<Link to={`/topic/${topic.id}`} className="block">
			<div className="py-2 px-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
				<div className="zone-a w-5 flex-shrink-0">
					<div
						className={`w-2 h-2 rounded-full border border-black ${isRead ? "bg-muted" : "bg-primary"}`}
					/>
				</div>
				<div className="zone-b flex-[60] min-w-0">
					<h3 className="font-bold text-sm truncate">{topic.topicName}</h3>
					<p className="text-[10px] text-muted-foreground truncate">
						{topic.topicDescription}
					</p>
				</div>
				<div className="zone-c w-[10%] text-center flex-shrink-0 flex flex-col justify-center">
					<div className="font-black text-sm">{threadCount}</div>
					<div className="text-[10px] font-bold text-muted-foreground">
						Threads
					</div>
				</div>
				<div className="zone-d w-[30%] flex items-center gap-2 flex-shrink-0">
					{latestPost ? (
						<>
							<div className="neo-brutal-avatar h-5 w-5 text-[8px] overflow-hidden flex items-center justify-center border flex-shrink-0">
								<span className="text-white">{latestPost.authorInitials}</span>
							</div>
							<div className="min-w-0 flex-1">
								<div className="text-[10px] font-bold truncate">
									{latestPost.title}
								</div>
								<div className="text-[10px] text-muted-foreground">
									{latestPost.timeAgo}
								</div>
							</div>
						</>
					) : (
						<div className="text-xs text-muted-foreground">-</div>
					)}
				</div>
			</div>
		</Link>
	);
};

const ThreadRow = ({ thread, topicName, topicColor }: ThreadRowProps) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [imgError, setImgError] = useState(false);

	const username = thread.author?.username || thread.authorName;
	useEffect(() => {
		if (!username) return;
		api
			.getUserProfile(username)
			.then((res) => {
				if (res.success && res.user.imageUrl) {
					setAvatarUrl(res.user.imageUrl.replace("http://", "https://"));
				}
			})
			.catch(() => {
				setImgError(true);
			});
	}, [username]);

	const initials = (username || "??").substring(0, 2).toUpperCase();

	return (
		<Link to={`/thread/${thread.id}`} className="block">
			<div className="py-2 px-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
				<div className="col-author w-10 flex-shrink-0">
					<div className="neo-brutal-avatar h-8 w-8 text-[10px] overflow-hidden flex items-center justify-center border-2">
						{!imgError && avatarUrl ? (
							<img
								src={avatarUrl}
								alt={username}
								className="h-full w-full object-cover"
								referrerPolicy="no-referrer"
								onError={() => setImgError(true)}
							/>
						) : (
							<span className="text-white">{initials}</span>
						)}
					</div>
				</div>
				<div className="col-title flex-[60] min-w-0">
					<div className="flex items-center gap-1 mb-0.5">
						{thread.isPinned && (
							<Badge className="bg-accent text-accent-foreground border-2 border-black font-black text-[10px] px-1 py-0">
								PIN
							</Badge>
						)}
						<span
							className={`rounded border border-black ${topicColor || getTopicColor(thread.topicId || "")} px-1 py-0 font-bold text-[10px] text-black uppercase`}
						>
							{topicName || thread.topicName}
						</span>
					</div>
					<h3 className="font-bold text-sm truncate">
						{thread.title || thread.threadTitle}
					</h3>
					<p className="text-[10px] text-muted-foreground">
						{username || "Unknown"}
					</p>
				</div>
				<div className="col-replies w-16 text-center flex-shrink-0 flex flex-col justify-center">
					<div className="font-black text-sm">{thread.replies ?? 0}</div>
					<div className="text-[10px] font-bold text-muted-foreground">
						Replies
					</div>
				</div>
				<div className="col-last w-20 text-right flex-shrink-0 flex flex-col justify-center">
					<div className="text-[10px] font-bold truncate">
						{formatTimeAgo(thread.lastActive || "")}
					</div>
				</div>
			</div>
		</Link>
	);
};

export const TopicThreadRow = (props: TopicRowProps | ThreadRowProps) => {
	if ("thread" in props) {
		return <ThreadRow {...props} />;
	}
	return <TopicRow {...props} />;
};

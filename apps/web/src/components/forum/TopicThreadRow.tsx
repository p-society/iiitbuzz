import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { ThreadListItem, Topic } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";
import { getTopicColor, getTopicColorHex } from "@/lib/utils/topicColor";

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
	return (
		<Link to={`/topic/${topic.id}`} className="block">
			<div
				className={`py-2 px-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${getTopicColor(topic.id)}`}
			>
				<div className="zone-a w-5 flex-shrink-0">
					<div className="w-2.5 h-2.5 bg-black rotate-45" />
				</div>
				<div className="zone-b flex-[60] min-w-0">
					<h3 className="font-bold text-sm truncate uppercase tracking-tight">
						{topic.topicName}
					</h3>
					<p className="mono-meta truncate">{topic.topicDescription}</p>
				</div>
				<div className="zone-c w-[10%] text-center flex-shrink-0 flex flex-col justify-center">
					<div className="font-bold text-sm">{threadCount}</div>
					<div className="mono-label">Threads</div>
				</div>
				<div className="zone-d w-[30%] flex items-center gap-2 flex-shrink-0">
					{latestPost ? (
						<>
							<div className="h-5 w-5 flex items-center justify-center bg-foreground text-background text-[8px] font-bold border border-black flex-shrink-0 overflow-hidden">
								<span>{latestPost.authorInitials}</span>
							</div>
							<div className="min-w-0 flex-1">
								<div className="text-[10px] font-bold truncate">
									{latestPost.title}
								</div>
								<div className="mono-meta">{latestPost.timeAgo}</div>
							</div>
						</>
					) : (
						<div className="mono-meta">—</div>
					)}
				</div>
			</div>
		</Link>
	);
};

const ThreadRow = ({ thread, topicName, topicColor }: ThreadRowProps) => {
	const navigate = useNavigate();
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
	const color = topicColor || getTopicColorHex(thread.topicId);
	const profileUsername = !thread.isAnonymous && username ? username : null;

	const goToProfile = (event: React.MouseEvent | React.KeyboardEvent) => {
		if (!profileUsername) return;
		event.preventDefault();
		event.stopPropagation();
		navigate(`/profile/${encodeURIComponent(profileUsername)}`);
	};

	return (
		<Link to={`/thread/${thread.id}`} className="block">
			<div className="py-2 px-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
				<div className="col-author w-10 flex-shrink-0">
					<div
						className={`h-8 w-8 flex items-center justify-center bg-foreground text-background text-[10px] font-bold border border-black overflow-hidden ${profileUsername ? "cursor-pointer hover:opacity-85" : ""}`}
						onClick={goToProfile}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								goToProfile(event);
							}
						}}
						role={profileUsername ? "button" : undefined}
						tabIndex={profileUsername ? 0 : undefined}
					>
						{!imgError && avatarUrl ? (
							<img
								src={avatarUrl}
								alt={username}
								className="h-full w-full object-cover"
								referrerPolicy="no-referrer"
								onError={() => setImgError(true)}
							/>
						) : (
							<span>{initials}</span>
						)}
					</div>
				</div>
				<div className="col-title flex-[60] min-w-0">
					<div className="flex items-center gap-1 mb-0.5">
						{thread.isPinned && (
							<span className="tech-stamp text-[9px] bg-foreground text-background border-foreground">
								PIN
							</span>
						)}
						<span
							className="mono-label border border-current px-1 text-[9px]"
							style={{ color, borderColor: color }}
						>
							{topicName || thread.topicName}
						</span>
					</div>
					<h3 className="font-bold text-sm truncate">
						{thread.title || thread.threadTitle}
					</h3>
					<span
						className={`mono-meta ${profileUsername ? "cursor-pointer hover:underline" : ""}`}
						onClick={goToProfile}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								goToProfile(event);
							}
						}}
						role={profileUsername ? "button" : undefined}
						tabIndex={profileUsername ? 0 : undefined}
					>
						{username || "Unknown"}
					</span>
				</div>
				<div className="col-replies w-16 text-center flex-shrink-0 flex flex-col justify-center">
					<div className="font-bold text-sm">{thread.replies ?? 0}</div>
					<div className="mono-label">Replies</div>
				</div>
				<div className="col-last w-20 text-right flex-shrink-0 flex flex-col justify-center">
					<span className="mono-meta text-right">
						[ {formatTimeAgo(thread.lastActive || "").toUpperCase()} ]
					</span>
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

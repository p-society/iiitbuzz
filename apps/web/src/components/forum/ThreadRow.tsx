import { Link, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import type { ThreadListItem } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";
import { getTopicColorHex } from "@/lib/utils/topicColor";

export const ThreadRow = ({ thread }: { thread: ThreadListItem }) => {
	const navigate = useNavigate();
	const avatarInitials = (thread.authorName || "??")
		.substring(0, 2)
		.toUpperCase();

	const topicColor = getTopicColorHex(thread.topicId);
	const profileUsername =
		!thread.isAnonymous && (thread.author?.username || thread.authorName)
			? thread.author?.username || thread.authorName
			: null;

	const goToProfile = (event: React.MouseEvent | React.KeyboardEvent) => {
		if (!profileUsername) return;
		event.preventDefault();
		event.stopPropagation();
		navigate(`/profile/${encodeURIComponent(profileUsername)}`);
	};

	return (
		<Link to={`/thread/${thread.id}`} className="block">
			<div className="py-2 px-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
				<div className="col-avatar w-10 flex-shrink-0">
					<div
						className={`h-8 w-8 flex items-center justify-center bg-foreground text-background text-[10px] font-bold border border-black ${profileUsername ? "cursor-pointer hover:opacity-85" : ""}`}
						onClick={goToProfile}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								goToProfile(event);
							}
						}}
						role={profileUsername ? "button" : undefined}
						tabIndex={profileUsername ? 0 : undefined}
					>
						{avatarInitials}
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
							style={{ color: topicColor, borderColor: topicColor }}
						>
							{thread.topicName}
						</span>
					</div>
					<h3 className="font-bold text-sm truncate">{thread.title}</h3>
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
						{thread.authorName || "Anonymous"}
					</span>
				</div>

				<div className="col-stats w-16 flex-shrink-0 flex flex-col items-center justify-center">
					<div className="flex items-center gap-1">
						<MessageSquare
							className="h-3 w-3 text-muted-foreground"
							strokeWidth={1.5}
						/>
						<span className="font-bold text-sm">{thread.replies}</span>
					</div>
				</div>

				<div className="col-last w-24 flex-shrink-0 flex flex-col items-end justify-center">
					<span className="mono-meta text-right">
						[ {formatTimeAgo(thread.lastActive || "").toUpperCase()} ]
					</span>
				</div>
			</div>
		</Link>
	);
};

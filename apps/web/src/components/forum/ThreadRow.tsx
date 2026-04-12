import { Link } from "react-router-dom";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ThreadListItem } from "@/types/forum";
import { formatTimeAgo } from "@/lib/utils/date";

export const ThreadRow = ({ thread }: { thread: ThreadListItem }) => {
	const avatarInitials = (thread.authorName || "??")
		.substring(0, 2)
		.toUpperCase();

	return (
		<Link to={`/thread/${thread.id}`} className="block">
			<div className="thread-row py-2 px-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
				<div className="col-avatar w-10 flex-shrink-0">
					<div className="neo-brutal-avatar h-8 w-8 text-[10px] border-2 flex items-center justify-center">
						{avatarInitials}
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
							className={`rounded border border-black ${thread.topicColor} px-1 py-0 font-bold text-[10px] text-black uppercase`}
						>
							{thread.topicName}
						</span>
					</div>
					<h3 className="font-bold text-sm truncate">{thread.title}</h3>
					<p className="text-[10px] text-muted-foreground">
						{thread.authorName || "Anonymous"}
					</p>
				</div>

				<div className="col-stats w-20 flex-shrink-0 flex flex-col justify-center text-center">
					<div className="flex items-center justify-center gap-1">
						<MessageSquare className="h-3 w-3 text-muted-foreground" />
						<span className="font-black text-sm">{thread.replies}</span>
					</div>
				</div>

				<div className="col-last w-24 flex-shrink-0 flex flex-col justify-center text-right">
					<span className="text-[10px] font-bold truncate">
						{formatTimeAgo(thread.lastActive || "")}
					</span>
				</div>
			</div>
		</Link>
	);
};

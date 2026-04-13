import { Link } from "react-router";
import { MessageSquare, Eye } from "lucide-react";
import type { RecentThread } from "@/types/forum";
import { getTopicColorHex } from "@/lib/utils/topicColor";

export const RecentThreadRow = ({ thread }: { thread: RecentThread }) => {
	const topicColor = getTopicColorHex(
		thread.topicColor ? undefined : undefined,
	);

	return (
		<Link to={`/thread/${thread.id}`} className="block">
			<div className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="flex-1 min-w-0">
						<h3 className="mb-1 font-bold text-sm leading-tight truncate">
							{thread.title}
						</h3>
						<div className="flex flex-wrap items-center gap-2 mono-meta">
							<span className="font-bold text-foreground">{thread.author}</span>
							<span
								className="mono-label border border-current px-1 text-[9px]"
								style={{ color: thread.topicColor ? undefined : "#6b7280" }}
							>
								{thread.topic}
							</span>
							<span>{thread.lastActive}</span>
						</div>
					</div>
					<div className="flex gap-3 mono-meta sm:shrink-0">
						<span className="flex items-center gap-1">
							<MessageSquare className="h-3 w-3" strokeWidth={1.5} />
							{thread.replies}
						</span>
						<span className="flex items-center gap-1 text-muted-foreground">
							<Eye className="h-3 w-3" strokeWidth={1.5} />
							{thread.views}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

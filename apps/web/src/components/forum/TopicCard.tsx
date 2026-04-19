import { Link } from "react-router";
import { MessageSquare } from "lucide-react";
import type { Topic } from "@/types/forum";
import { getTopicColor, getTopicColorHex } from "@/lib/utils/topicColor";

export const TopicCard = ({ topic }: { topic: Topic }) => (
	<Link to={`/topic/${topic.id}`} className="group block">
		<div
			className={`border border-border p-4 sm:p-6 h-full flex flex-col transition-colors hover:bg-muted/40 ${getTopicColor(topic.id)}`}
		>
			<div className="flex items-center justify-between mb-3">
				<span
					className="mono-label text-[9px]"
					style={{ color: getTopicColorHex(topic.id) }}
				>
					[ {String(topic.threadCount ?? 0).padStart(3, "0")} ]
				</span>
				<MessageSquare
					className="w-4 h-4 text-muted-foreground"
					strokeWidth={1.5}
				/>
			</div>
			<h3 className="font-black text-lg sm:text-xl uppercase tracking-tight truncate mb-2">
				{topic.topicName}
			</h3>
			<p
				className="text-sm text-muted-foreground line-clamp-2 flex-1"
				style={{ lineHeight: 1.6 }}
			>
				{topic.topicDescription}
			</p>
			<div className="mt-4 pt-3 border-t border-border">
				<span
					className="mono-label text-[9px]"
					style={{ color: getTopicColorHex(topic.id) }}
				>
					{topic.threadCount ?? 0} THREADS
				</span>
			</div>
		</div>
	</Link>
);

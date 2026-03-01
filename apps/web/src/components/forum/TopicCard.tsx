import { Link } from "react-router";
import { MessageSquare } from "lucide-react";
import type { Topic } from "@/types/forum";

export const TopicCard = ({ topic }: { topic: Topic }) => (
    <Link to={`/topic/${topic.id}`} className="group block">
        <div className="neo-brutal-card-lg p-4 sm:p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg sm:text-xl truncate mb-3">
                {topic.topicName}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {topic.topicDescription}
            </p>
            <div className="flex gap-4 text-xs sm:text-sm font-bold mt-auto">
                <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {topic.threadCount ?? 0} Threads
                </span>
            </div>
        </div>
    </Link>
);
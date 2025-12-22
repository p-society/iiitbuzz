import type { TopicOption } from "@/types/forum";

interface CategoryTileProps {
    topic: TopicOption;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export const CategoryTile = ({ topic, isSelected, onClick, disabled }: CategoryTileProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`border-4 border-black p-3 sm:p-4 text-left font-bold text-sm sm:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] ${
                isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
            } disabled:opacity-70`}
        >
            <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{topic.icon}</span>
                <span className="leading-tight">{topic.topicName}</span>
            </div>
        </button>
    );
};
import type { TopicOption } from "@/types/forum";

interface CategoryTileProps {
	topic: TopicOption;
	isSelected: boolean;
	onClick: () => void;
	disabled?: boolean;
}

export const CategoryTile = ({
	topic,
	isSelected,
	onClick,
	disabled,
}: CategoryTileProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`border border-border p-3 sm:p-4 text-left transition-colors ${
				isSelected
					? "bg-foreground text-background"
					: "bg-card text-foreground hover:bg-muted/40"
			} disabled:opacity-70`}
		>
			<div className="flex items-center gap-2">
				<span className="text-xl sm:text-2xl">{topic.icon}</span>
				<span className="font-bold text-sm sm:text-base leading-tight uppercase tracking-tight">
					{topic.topicName}
				</span>
			</div>
		</button>
	);
};

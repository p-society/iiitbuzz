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
			className={`border border-black p-3 sm:p-4 text-left transition-colors ${
				isSelected
					? "bg-black text-white"
					: "bg-white text-foreground hover:bg-gray-50"
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

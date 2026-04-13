/**
 * Generates a consistent accent border-left class based on a string ID.
 * Returns a Tailwind border-left color class for the "accent edge" technical-brutalist design.
 */
export const getTopicColor = (topicId?: string): string => {
	if (!topicId) return "accent-border-yellow";

	const colors = [
		"accent-border-red",
		"accent-border-blue",
		"accent-border-green",
		"accent-border-yellow",
		"accent-border-purple",
		"accent-border-pink",
		"accent-border-indigo",
		"accent-border-orange",
		"accent-border-teal",
		"accent-border-cyan",
	];

	let hash = 0;
	for (let i = 0; i < topicId.length; i++) {
		hash = topicId.charCodeAt(i) + ((hash << 5) - hash);
	}

	const index = Math.abs(hash) % colors.length;
	return colors[index];
};

/**
 * Returns a hex color string for inline styles (topic badge text, etc.).
 */
export const getTopicColorHex = (topicId?: string): string => {
	if (!topicId) return "#eab308";

	const colors = [
		"#ef4444",
		"#3b82f6",
		"#22c55e",
		"#eab308",
		"#a855f7",
		"#ec4899",
		"#6366f1",
		"#f97316",
		"#14b8a6",
		"#06b6d4",
	];

	let hash = 0;
	for (let i = 0; i < topicId.length; i++) {
		hash = topicId.charCodeAt(i) + ((hash << 5) - hash);
	}

	const index = Math.abs(hash) % colors.length;
	return colors[index];
};

/**
 * Returns a very faint background tint class for hover states.
 */
export const getTopicColorBg = (topicId?: string): string => {
	if (!topicId) return "bg-yellow-50";

	const bgs = [
		"bg-red-50",
		"bg-blue-50",
		"bg-green-50",
		"bg-yellow-50",
		"bg-purple-50",
		"bg-pink-50",
		"bg-indigo-50",
		"bg-orange-50",
		"bg-teal-50",
		"bg-cyan-50",
	];

	let hash = 0;
	for (let i = 0; i < topicId.length; i++) {
		hash = topicId.charCodeAt(i) + ((hash << 5) - hash);
	}

	const index = Math.abs(hash) % bgs.length;
	return bgs[index];
};

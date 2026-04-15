/**
 * Parses a date string from the API and returns a UTC-aware Date object.
 * Backend (PostgreSQL) stores timestamps in UTC. Some APIs return ISO strings
 * with a "Z" suffix, others without. This ensures we always compare in UTC
 * by normalizing the input before computing the difference.
 */
const parseAsUTCDate = (isoString: string): Date => {
	if (!isoString) return new Date();
	const trimmed = isoString.trim();
	if (trimmed.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
		return new Date(trimmed);
	}
	return new Date(trimmed + "Z");
};

export const formatTimeAgo = (isoString: string): string => {
	if (!isoString) return "Just now";
	const date = parseAsUTCDate(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 30) return `${diffDays}d ago`;
	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) return `${diffMonths}mo ago`;
	return `${Math.floor(diffMonths / 12)}y ago`;
};

/**
 * Format a date string for display in IST (UTC+5:30).
 */
export const formatDateIST = (isoString: string): string => {
	const date = parseAsUTCDate(isoString);
	return date.toLocaleDateString("en-IN", {
		timeZone: "Asia/Kolkata",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

/**
 * Format a date string with time in IST.
 */
export const formatDateTimeIST = (isoString: string): string => {
	const date = parseAsUTCDate(isoString);
	return date.toLocaleString("en-IN", {
		timeZone: "Asia/Kolkata",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
};

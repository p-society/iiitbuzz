import type {
	Topic,
	ForumStats,
	Pagination,
	TopicDetail,
	ThreadListItem,
	ThreadDetail,
} from "@/types/forum";
import type {
	UserProfile,
	ProfileFormData,
	UserMentionSuggestion,
} from "@/types/user";

const BASE_URL =
	import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

async function apiFetch<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const hasBody = options?.body !== undefined;
	const response = await fetch(`${BASE_URL}/api${endpoint}`, {
		...options,
		credentials: "include",
		headers: {
			...(hasBody ? { "Content-Type": "application/json" } : {}),
			...options?.headers,
		},
	});

	if (response.status === 204) {
		return { success: true } as T;
	}

	const raw = await response.text();
	const data = raw ? JSON.parse(raw) : {};

	if (!response.ok || !data.success) {
		throw new Error(data.error || `API Error: ${response.status}`);
	}

	return data;
}

export const api = {
	getTopics: () => apiFetch<{ success: boolean; data: Topic[] }>("/topics"),

	getThreads: (params: {
		page: number;
		limit: number;
		sort: string;
		search?: string;
	}) => {
		const sp = new URLSearchParams();
		sp.set("page", String(params.page));
		sp.set("limit", String(params.limit));
		sp.set("sort", params.sort);
		if (params.search) sp.set("search", params.search);
		return apiFetch<{
			success: boolean;
			threads: ThreadListItem[];
			pagination: Pagination;
		}>(`/threads?${sp.toString()}`);
	},

	getUserThreads: (
		userId: string,
		params: { page: number; limit: number; sort: string; search?: string },
	) => {
		const sp = new URLSearchParams();
		sp.set("page", String(params.page));
		sp.set("limit", String(params.limit));
		sp.set("sort", params.sort);
		if (params.search) sp.set("search", params.search);
		return apiFetch<{
			success: boolean;
			threads: ThreadListItem[];
			pagination: Pagination;
		}>(`/users/${userId}/threads?${sp.toString()}`);
	},

	getThreadById: (id: string) =>
		apiFetch<{ success: boolean; thread: ThreadDetail }>(`/threads/${id}`),

	getUserProfile: (username: string) =>
		apiFetch<{
			success: boolean;
			user: UserProfile;
			isOwnProfile: boolean;
		}>(`/user/details/${username}`),

	searchUsers: (q: string, limit = 5) => {
		const sp = new URLSearchParams();
		if (q) sp.set("q", q);
		sp.set("limit", String(limit));
		return apiFetch<{
			success: boolean;
			users: UserMentionSuggestion[];
		}>(`/user/search?${sp.toString()}`);
	},

	updateProfile: async (formData: ProfileFormData) => {
		const updateData = {
			...formData,
			passingOutYear: formData.passingOutYear
				? parseInt(formData.passingOutYear)
				: null,
		};

		const cleanedData: Record<string, string | number | null> = {};
		Object.entries(updateData).forEach(([key, value]) => {
			cleanedData[key] = value === "" ? null : value;
		});

		return apiFetch<{ success: boolean; username: string }>("/user/me", {
			method: "PATCH",
			body: JSON.stringify(cleanedData),
		});
	},

	createThread: (payload: {
		topicId: string;
		threadTitle: string;
		content: string;
		isAnonymous?: boolean;
	}) =>
		apiFetch<{ success: boolean; thread: { id: string } }>("/threads/new", {
			method: "POST",
			body: JSON.stringify(payload),
		}),

	getTopicById: (topicId: string) =>
		apiFetch<{ success: boolean; topic: TopicDetail }>(`/topics/${topicId}`),

	getThreadsByTopic: (
		topicId: string,
		page: number,
		limit: number,
		sort: string,
	) =>
		apiFetch<{
			success: boolean;
			threads: ThreadListItem[];
			pagination: { count: number };
		}>(`/topics/${topicId}/threads?page=${page}&limit=${limit}&sort=${sort}`),

	getPostsByThreadId: (threadId: string) =>
		apiFetch<{ success: boolean; posts: PostDetail[] }>(
			`/threads/${threadId}/posts?limit=100`,
		),

	getPostReportStatus: (postId: string) =>
		apiFetch<{
			success: boolean;
			alreadyReported: boolean;
			status: string | null;
		}>(`/posts/${postId}/report-status`),

	getThreadBookmarkStatus: (threadId: string) =>
		apiFetch<{ success: boolean; isBookmarked: boolean }>(
			`/threads/${threadId}/bookmark`,
		),

	addThreadBookmark: (threadId: string) =>
		apiFetch<{ success: boolean; isBookmarked: boolean }>(
			`/threads/${threadId}/bookmark`,
			{ method: "PUT", body: JSON.stringify({}) },
		),

	removeThreadBookmark: (threadId: string) =>
		apiFetch<{ success: boolean; isBookmarked: boolean }>(
			`/threads/${threadId}/bookmark`,
			{ method: "DELETE" },
		),

	createPost: (payload: {
		threadId: string;
		content: string;
		isAnonymous?: boolean;
	}) =>
		apiFetch<{ success: boolean; post: PostDetail; isAnonymous: boolean }>(
			"/posts",
			{
				method: "POST",
				body: JSON.stringify(payload),
			},
		),

	deletePost: (postId: string) =>
		apiFetch<{ success: boolean }>(`/posts/${postId}`, {
			method: "DELETE",
		}),

	reportPost: (postId: string) =>
		apiFetch<{
			success: boolean;
			alreadyReported: boolean;
			status?: string;
		}>(`/posts/${postId}/report`, {
			method: "POST",
			body: JSON.stringify({}),
		}),

	deleteThread: (threadId: string) =>
		apiFetch<{ success: boolean }>(`/threads/${threadId}`, {
			method: "DELETE",
		}),

	// Votes
	voteOnPost: (postId: string, value: number) =>
		apiFetch<{ success: boolean; voted: boolean; value: number }>(
			`/posts/${postId}/vote`,
			{
				method: "POST",
				body: JSON.stringify({ postId, value }),
			},
		),

	getPostVote: (postId: string) =>
		apiFetch<{ success: boolean; vote: number }>(`/posts/${postId}/vote`),

	// Notifications
	getNotifications: () =>
		apiFetch<{
			success: boolean;
			notifications: NotificationItem[];
			unreadCount: number;
		}>("/notifications"),

	markNotificationsRead: () =>
		apiFetch<{ success: boolean }>("/notifications/read", { method: "PUT" }),

	markNotificationRead: (id: string) =>
		apiFetch<{ success: boolean }>(`/notifications/${id}/read`, {
			method: "PUT",
		}),

	// Upload (presigned URL flow)
	presignUpload: (postId: string, imageId: string, contentType: string) =>
		apiFetch<{ success: boolean; uploadUrl: string; fileUrl: string }>(
			"/upload/presign",
			{
				method: "POST",
				body: JSON.stringify({ postId, imageId, contentType }),
			},
		),

	uploadToR2: async (uploadUrl: string, file: File) => {
		const response = await fetch(uploadUrl, {
			method: "PUT",
			body: file,
			headers: { "Content-Type": file.type },
		});
		if (!response.ok) throw new Error("Failed to upload image to storage");
	},

	// Draft posts
	createDraftPost: (threadId: string) =>
		apiFetch<{ success: boolean; post: { id: string; isDraft: boolean } }>(
			"/posts/draft",
			{ method: "POST", body: JSON.stringify({ threadId }) },
		),

	publishDraft: (postId: string, content: string, isAnonymous?: boolean) =>
		apiFetch<{ success: boolean; post: PostDetail }>(
			`/posts/${postId}/publish`,
			{ method: "PATCH", body: JSON.stringify({ content, isAnonymous }) },
		),

	// Stats
	getStats: () => apiFetch<{ success: boolean; stats: ForumStats }>("/stats"),

	getUserStats: (userId: string) =>
		apiFetch<{
			success: boolean;
			stats: {
				totalTopics: number;
				totalThreads: number;
			};
		}>(`/stats/${userId}`),

	// Admin
	getPendingThreads: () =>
		apiFetch<{
			success: boolean;
			threads: AdminThread[];
		}>("/admin/threads/pending"),

	getApprovedThreads: () =>
		apiFetch<{
			success: boolean;
			threads: AdminThread[];
		}>("/admin/threads/approved"),

	getRejectedThreads: () =>
		apiFetch<{
			success: boolean;
			threads: AdminThread[];
		}>("/admin/threads/rejected"),

	approveThread: (id: string) =>
		apiFetch<{ success: boolean; thread: AdminThread }>(
			`/admin/threads/${id}/approve`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),

	rejectThread: (id: string) =>
		apiFetch<{ success: boolean; thread: AdminThread }>(
			`/admin/threads/${id}/reject`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),

	// Admin Posts
	getPendingPosts: () =>
		apiFetch<{
			success: boolean;
			posts: AdminPost[];
		}>("/admin/posts/pending"),

	getApprovedPosts: () =>
		apiFetch<{
			success: boolean;
			posts: AdminPost[];
		}>("/admin/posts/approved"),

	getRejectedPosts: () =>
		apiFetch<{
			success: boolean;
			posts: AdminPost[];
		}>("/admin/posts/rejected"),

	approvePost: (id: string) =>
		apiFetch<{ success: boolean; post: AdminPost }>(
			`/admin/posts/${id}/approve`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),

	rejectPost: (id: string) =>
		apiFetch<{ success: boolean; post: AdminPost }>(
			`/admin/posts/${id}/reject`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),

	getUserActivity: (userId: string) =>
		apiFetch<{
			success: boolean;
			activity: ActivityItem[];
		}>(`/user/${userId}/activity`),

	getUserBookmarks: (userId: string) =>
		apiFetch<{
			success: boolean;
			threads: BookmarkedThread[];
		}>(`/user/${userId}/bookmarks`),

	getPendingReports: () =>
		apiFetch<{
			success: boolean;
			reports: AdminReport[];
		}>("/admin/reports/pending"),

	getResolvedReports: () =>
		apiFetch<{
			success: boolean;
			reports: AdminReport[];
		}>("/admin/reports/resolved"),

	resolveReport: (id: string) =>
		apiFetch<{ success: boolean; report: AdminReport }>(
			`/admin/reports/${id}/resolve`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),

	deleteReportedPost: (id: string) =>
		apiFetch<{ success: boolean; report: AdminReport }>(
			`/admin/reports/${id}/delete-post`,
			{ method: "PATCH", body: JSON.stringify({}) },
		),
};

export type ActivityItem = {
	id: string;
	type: "thread" | "post" | "like";
	title: string;
	content?: string;
	threadId?: string;
	createdAt: string;
};

export type BookmarkedThread = {
	id: string;
	threadTitle: string;
	topicName: string;
	topicId: string;
	authorName: string;
	replies: number;
	viewCount: number;
	createdAt: string;
};

type PostDetail = {
	postId: string;
	content: string;
	createdAt: string;
	likes: number;
	authorId: string;
	authorName: string;
};

type NotificationItem = {
	id: string;
	type: string;
	threadId: string | null;
	fromUserId: string | null;
	message: string | null;
	read: boolean;
	createdAt: string;
	fromUsername: string | null;
	threadTitle: string | null;
};

export type AdminThread = {
	id: string;
	threadTitle: string;
	topicId: string;
	topicName: string;
	createdAt: string;
	isAnonymous: boolean;
	isApproved: boolean;
	authorName: string | null;
};

export type AdminPost = {
	postId: string;
	content: string;
	createdAt: string;
	threadId: string;
	threadTitle?: string;
	authorName: string | null;
	isAnonymous: boolean;
	isApproved: boolean;
	isRejected: boolean;
};

export type AdminReport = {
	id: string;
	postId: string;
	postContent: string;
	threadId: string;
	threadTitle: string;
	reportedAt: string;
	status: string;
	reportedBy: string | null;
};

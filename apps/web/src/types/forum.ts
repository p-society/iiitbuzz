//used in Home.tsx
export interface Topic {
	id: string;
	topicName: string;
	topicDescription: string;
	threadCount?: number;
	postCount?: number;
	category?: string;
	latestPost?: {
		title: string;
		authorInitials: string;
		timeAgo: string;
	};
}

export interface RecentThread {
	id: string;
	title: string;
	author: string;
	topic: string;
	topicColor: string;
	replies: number;
	views: number;
	lastActive: string;
}

export interface ForumStats {
	totalTopics: number;
	totalThreads: number;
	totalPosts: number;
	totalMembers: number;
	onlineMembers?: number;
}

//used in thread.$threadId.tsx

export interface ThreadDetail {
	id: string;
	title: string;
	threadTitle: string;
	topicId: string;
	topicName: string;
	topicColor?: string;
	authorId: string;
	createdBy: string;
	authorName: string;
	createdAt: string;
	viewCount: number;
	isPinned: boolean;
}

export interface PostDetail {
	postId: string;
	content: string;
	createdAt: string;
	authorId: string;
	authorName: string;
	authorAvatar: string;
	postCount?: number;
	likes: number;
}

//used in threads.tsx
export interface ThreadListItem {
	id: string;
	title: string;
	threadTitle?: string;
	topicName: string;
	topicId?: string;
	topicColor?: string;
	authorName?: string;
	author?: { username: string };
	lastActive?: string;
	createdAt?: string;
	replies?: number;
	replyCount?: number;
	views?: number;
	viewCount?: number;
	likes?: number;
	isPinned?: boolean;
	isAnonymous?: boolean;
	isApproved?: boolean;
}

export interface Pagination {
	page: number;
	limit: number;
	count: number;
}

// for new-thread.ts

export interface TopicOption {
	id: string;
	topicName: string;
	icon?: string;
}

//for thread/$threadId

export interface TopicDetail {
	id: string;
	topicName: string;
	topicDescription: string;
}

export interface Thread {
	id: string;
	threadTitle: string;
	createdAt: string;
	author?: {
		username: string;
	};
	replyCount: number;
	viewCount: number;
	likes: number;
	isPinned?: boolean;
}

export type ThreadSortOption = "latest" | "top" | "trending" | "views";

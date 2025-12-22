import {
	BookOpen,
	MessageSquare,
	ShoppingCart,
	Users,
	Zap,
} from "lucide-react";
import React from "react";

// --- User Data ---
export const mockUser = {
	id: "user-123",
	username: "sarah_chen",
	firstName: "Sarah",
	lastName: "Chen",
	email: "sarah.chen@example.com",
	pronouns: "she/her",
	bio: "CS major interested in AI and machine learning. Always happy to help with coding questions!",
	branch: "CSE",
	passingOutYear: 2025,
	avatar: "SC",
	role: "Active Member",
	joinDate: "January 2024",
	location: "Computer Science Dept",
	totalPosts: 234,
};

// --- topics ---
export const topics = [
	{
		id: 1,
		name: "General Discussion",
		description: "Talk about anything college-related",
		topics: 145,
		posts: 2341,
		color: "bg-secondary",
		icon: React.createElement(MessageSquare, { className: "w-6 h-6" }),
	},
	{
		id: 2,
		name: "Academics",
		description: "Course discussions, study groups, and academic help",
		topics: 89,
		posts: 1205,
		color: "bg-accent",
		icon: React.createElement(BookOpen, { className: "w-6 h-6" }),
	},
	{
		id: 3,
		name: "Campus Life",
		description: "Events, clubs, housing, and campus activities",
		topics: 112,
		posts: 1876,
		color: "bg-primary",
		icon: React.createElement(Users, { className: "w-6 h-6" }),
	},
	{
		id: 4,
		name: "Tech & Gaming",
		description: "Technology discussions, gaming, and PC builds",
		topics: 203,
		posts: 3456,
		color: "bg-secondary",
		icon: React.createElement(Zap, { className: "w-6 h-6" }),
	},
	{
		id: 5,
		name: "Marketplace",
		description: "Buy, sell, and trade items with fellow students",
		topics: 67,
		posts: 892,
		color: "bg-accent",
		icon: React.createElement(ShoppingCart, { className: "w-6 h-6" }),
	},
];

// --- Recent Threads (Home) ---
export const homeRecentThreads = [
	{
		id: 1,
		title: "Best study spots on campus?",
		author: "Sarah Chen",
		category: "Campus Life",
		replies: 23,
		views: 456,
		lastActive: "5m ago",
	},
	{
		id: 2,
		title: "CS 201 Midterm Study Group",
		author: "Mike Johnson",
		category: "Academics",
		replies: 15,
		views: 234,
		lastActive: "12m ago",
	},
	{
		id: 3,
		title: "Gaming tournament this weekend!",
		author: "Alex Kim",
		category: "Tech & Gaming",
		replies: 47,
		views: 892,
		lastActive: "18m ago",
	},
];

// --- All Threads ---
export const allThreads = [
	{
		id: 1,
		title: "What are your favorite spots to hang out between classes?",
		author: "Sarah Chen",
		avatar: "SC",
		category: "General Discussion",
		colorClass: "bg-secondary",
		replies: 23,
		views: 456,
		likes: 12,
		lastActive: "5 minutes ago",
		isPinned: true,
	},
	{
		id: 2,
		title: "CS 201 Midterm Study Group",
		author: "Mike Johnson",
		avatar: "MJ",
		category: "Academics",
		colorClass: "bg-primary",
		replies: 15,
		views: 234,
		likes: 8,
		lastActive: "12 minutes ago",
		isPinned: false,
	},
	{
		id: 3,
		title: "Gaming tournament this weekend!",
		author: "Alex Kim",
		avatar: "AK",
		category: "Tech & Gaming",
		colorClass: "bg-accent",
		replies: 47,
		views: 892,
		likes: 34,
		lastActive: "18 minutes ago",
		isPinned: false,
	},
	{
		id: 4,
		title: "Best food options on campus - go!",
		author: "Emma Davis",
		avatar: "ED",
		category: "Campus Life",
		colorClass: "bg-secondary",
		replies: 56,
		views: 1234,
		likes: 45,
		lastActive: "1 hour ago",
		isPinned: false,
	},
	{
		id: 5,
		title: "Looking for roommate for next semester",
		author: "Chris Lee",
		avatar: "CL",
		category: "General Discussion",
		colorClass: "bg-primary",
		replies: 8,
		views: 156,
		likes: 3,
		lastActive: "2 hours ago",
		isPinned: false,
	},
	{
		id: 6,
		title: "Math 105 homework help needed!",
		author: "Jordan Smith",
		avatar: "JS",
		category: "Academics",
		colorClass: "bg-accent",
		replies: 12,
		views: 289,
		likes: 7,
		lastActive: "3 hours ago",
		isPinned: false,
	},
	{
		id: 7,
		title: "Selling textbooks - Calculus & Physics",
		author: "Taylor Brown",
		avatar: "TB",
		category: "Marketplace",
		colorClass: "bg-secondary",
		replies: 5,
		views: 178,
		likes: 2,
		lastActive: "4 hours ago",
		isPinned: false,
	},
	{
		id: 8,
		title: "What GPU should I get for my new build?",
		author: "Sam Wilson",
		avatar: "SW",
		category: "Tech & Gaming",
		colorClass: "bg-primary",
		replies: 31,
		views: 567,
		likes: 19,
		lastActive: "5 hours ago",
		isPinned: false,
	},
];

// --- My Profile Data ---
export const myProfileStats = {
	posts: 0,
	threads: 0,
	likes: 0,
	solutions: 0,
};

export const myProfileRecentThreads = [
	{
		id: 1,
		title: "What are your favorite spots to hang out between classes?",
		category: "General Discussion",
		categoryColor: "bg-secondary",
		replies: 23,
		views: 456,
		likes: 12,
		createdAt: "2 hours ago",
	},
];

export const myProfileRecentActivity = [
	{
		id: 1,
		type: "reply",
		threadTitle: "Gaming tournament this weekend!",
		action: "Replied to thread",
		time: "30 minutes ago",
	},
];

// --- Public Profile Data ---
export const profileStats = {
	posts: 234,
	threads: 45,
	likes: 892,
	solutions: 12,
};

export const profileRecentThreads = [
	{
		id: 1,
		title: "What are your favorite spots to hang out between classes?",
		category: "General Discussion",
		categoryColor: "bg-secondary",
		replies: 23,
		views: 456,
		likes: 12,
		createdAt: "2 hours ago",
	},
	{
		id: 2,
		title: "Looking for study partners for CS 301",
		category: "Academics",
		categoryColor: "bg-primary",
		replies: 8,
		views: 145,
		likes: 6,
		createdAt: "1 day ago",
	},
	{
		id: 3,
		title: "Best laptop for college under $1000?",
		category: "Tech & Gaming",
		categoryColor: "bg-accent",
		replies: 34,
		views: 678,
		likes: 28,
		createdAt: "3 days ago",
	},
];

export const profileRecentActivity = [
	{
		id: 1,
		type: "reply",
		threadTitle: "Gaming tournament this weekend!",
		action: "Replied to thread",
		time: "30 minutes ago",
	},
	{
		id: 2,
		type: "like",
		threadTitle: "New coffee shop opening near campus!",
		action: "Liked a post",
		time: "2 hours ago",
	},
];

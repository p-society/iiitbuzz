// Using divs with custom styling instead of Card to have full control over the color scheme
import { Clock, MessageSquare, Pin, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";

// Data remains the same
const forumData = [
	{
		id: 1,
		title: "IIIT Official",
		description: "Official announcements and updates",
		subforums: [
			{
				name: "Announcements",
				posts: "1.2k",
				lastPost: "2 hours ago",
				isPinned: true,
			},
		],
		posts: "5.2k",
		topics: "432",
	},
	{
		id: 2,
		title: "Academic Discussion",
		description: "Course discussions, study groups, and academic help",
		subforums: [
			{
				name: "CSE Courses",
				posts: "3.1k",
				lastPost: "15 minutes ago",
				isPinned: false,
			},
			{
				name: "ECE Courses",
				posts: "2.8k",
				lastPost: "1 hour ago",
				isPinned: false,
			},
			{
				name: "Study Groups",
				posts: "1.9k",
				lastPost: "30 minutes ago",
				isPinned: false,
			},
		],
		posts: "12.4k",
		topics: "1.8k",
	},
	{
		id: 3,
		title: "Campus Life",
		description: "Events, clubs, hostel life, and general campus discussions",
		subforums: [
			{
				name: "Events & Fests",
				posts: "2.1k",
				lastPost: "3 hours ago",
				isPinned: false,
			},
			{
				name: "Clubs & Societies",
				posts: "1.5k",
				lastPost: "1 hour ago",
				isPinned: false,
			},
		],
		posts: "8.7k",
		topics: "956",
	},
	{
		id: 4,
		title: "Tech Hub",
		description: "Programming, projects, internships, and tech discussions",
		subforums: [
			{
				name: "Project Showcase",
				posts: "891",
				lastPost: "45 minutes ago",
				isPinned: false,
			},
			{
				name: "Internship Help",
				posts: "2.3k",
				lastPost: "20 minutes ago",
				isPinned: false,
			},
		],
		posts: "15.2k",
		topics: "2.1k",
	},
];

const recentTopics = [
	{
		id: 1,
		title: "Midterm exam schedule released",
		author: "AdminUser",
		avatar: "AU",
		category: "Announcements",
		replies: 23,
		time: "18 minutes ago",
		isPinned: true,
	},
	{
		id: 2,
		title: "Looking for teammates for hackathon",
		author: "coder_123",
		avatar: "C1",
		category: "Tech Hub",
		replies: 8,
		time: "1 hour ago",
	},
	{
		id: 3,
		title: "Best places to eat near campus?",
		author: "foodie_student",
		avatar: "FS",
		category: "Campus Life",
		replies: 15,
		time: "2 hours ago",
	},
	{
		id: 4,
		title: "Data Structures assignment help",
		author: "confused_student",
		avatar: "CS",
		category: "Academic",
		replies: 12,
		time: "3 hours ago",
	},
	{
		id: 5,
		title: "Photography club meeting tomorrow",
		author: "photo_enthusiast",
		avatar: "PE",
		category: "Clubs",
		replies: 6,
		time: "4 hours ago",
	},
];

const Homepage = () => {
	return (
		// Main container with brutalist styling
		<div className="min-h-screen flex w-full bg-background text-foreground">
			<div className="flex-1 flex flex-col">
				{/* Use the brutalist header */}
				<Header />

				<div className="flex-1 flex">
					{/* Main Content */}
					<main className="flex-1 p-6">
						{/* Breadcrumb */}
						<div className="mb-6">
							<Button
								variant="ghost"
								size="sm"
								className="text-muted-foreground hover:text-foreground"
							>
								Home
							</Button>
						</div>

						{/* Forums Section */}
						<div className="space-y-6">
							<h2 className="text-2xl font-bold text-foreground text-black pixel-font">
								Threads
							</h2>

							{forumData.map((forum, idx) => (
								// Brutalist card styling
								<div
									key={forum.id}
									className={`neo-brutal-card p-6 ${
										[
											"neo-brutal-card-yellow",
											"neo-brutal-card-red",
											"neo-brutal-card-green",
											"neo-brutal-card-blue",
										][idx % 4]
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<MessageSquare className="w-8 h-8 text-black" />
												<div>
													<h3 className="text-lg font-semibold cursor-pointer text-black hover:text-black pixel-font">
														{forum.title}
													</h3>
													<p className="text-sm text-black para-text-font">
														{forum.description}
													</p>
												</div>
											</div>

											{/* Subforums with brutalist border */}
											<div className="ml-11 mt-4 space-y-2">
												{forum.subforums.map((subforum) => (
													<div
														key={`${forum.id}-${subforum.name}`}
														className="flex items-center justify-between py-2 border-b-4 border-black last:border-b-0"
													>
														<div className="flex items-center gap-2">
															{subforum.isPinned && (
																<Pin className="w-4 h-4 text-black" />
															)}
															<span className="text-sm font-medium cursor-pointer text-black hover:text-black para-text-font">
																{subforum.name}
															</span>
														</div>
														<div className="flex items-center gap-4 text-xs text-black para-text-font">
															<span>{subforum.posts} posts</span>
															<span>{subforum.lastPost}</span>
														</div>
													</div>
												))}
											</div>
										</div>

										<div className="text-right ml-4">
											<div className="text-lg font-semibold text-black pixel-font">
												{forum.posts}
											</div>
											<div className="text-sm text-black para-text-font">
												posts
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</main>

					{/* Sidebar with brutalist styling */}
					<aside className="w-80 p-6 border-l-4 border-primary bg-sidebar">
						<div className="space-y-8">
							<div>
								<h3 className="font-semibold mb-4 flex items-center gap-2 text-sidebar-foreground pixel-font">
									<TrendingUp className="w-4 h-4 text-accent" />
									Recent Topics
								</h3>
								<div className="space-y-3">
									{recentTopics.map((topic, idx) => (
										// Brutalist card styling
										<div
											key={topic.id}
											className={`neo-brutal-card p-3 cursor-pointer transition-all hover:translate-x-1 hover:translate-y-1 ${
												[
													"neo-brutal-card-yellow",
													"neo-brutal-card-red",
													"neo-brutal-card-green",
													"neo-brutal-card-blue",
												][idx % 4]
											}`}
										>
											<div className="flex gap-3 items-start">
												<div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 bg-accent text-sidebar-foreground">
													{topic.avatar}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start gap-1">
														{topic.isPinned && (
															<Pin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-sidebar-foreground" />
														)}
														<h4 className="text-sm font-medium line-clamp-2 text-sidebar-foreground hover:text-sidebar-foreground para-text-font">
															{topic.title}
														</h4>
													</div>
													<div className="flex items-center gap-2 mt-1 text-xs text-sidebar-foreground para-text-font">
														<span>By {topic.author}</span>
														<span>•</span>
														<span>{topic.time}</span>
													</div>
													<div className="flex items-center justify-between mt-2">
														<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/20 text-sidebar-foreground para-text-font">
															{topic.category}
														</span>
														<span className="text-xs text-sidebar-foreground para-text-font">
															{topic.replies} replies
														</span>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4 flex items-center gap-2 text-sidebar-foreground pixel-font">
									<Users className="w-4 h-4 text-muted-foreground" />
									Online Users
								</h3>
								<div className="text-sm text-sidebar-foreground para-text-font">
									<p>147 members online</p>
									<p>23 guests online</p>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4 flex items-center gap-2 text-sidebar-foreground pixel-font">
									<Clock className="w-4 h-4 text-muted-foreground" />
									Forum Stats
								</h3>
								<div className="space-y-2 text-sm text-sidebar-foreground para-text-font">
									<div className="flex justify-between">
										<span className="text-sidebar-foreground">
											Total Posts:
										</span>
										<span className="font-medium text-sidebar-foreground">
											41.5k
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sidebar-foreground">
											Total Topics:
										</span>
										<span className="font-medium text-sidebar-foreground">
											5.3k
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sidebar-foreground">
											Total Members:
										</span>
										<span className="font-medium text-sidebar-foreground">
											2.1k
										</span>
									</div>
								</div>
							</div>
						</div>
					</aside>
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default Homepage;

import "dotenv/config";
import { DrizzleClient } from "@/db/index";
import { users } from "@/db/schema/user.schema";
import { topics } from "@/db/schema/topic.schema";
import { threads } from "@/db/schema/thread.schema";
import { posts } from "@/db/schema/post.schema";

async function seed() {
	console.log("Seeding database...");

	const adminId = "00000000-0000-0000-0000-000000000001";
	const userId2 = "00000000-0000-0000-0000-000000000002";
	const userId3 = "00000000-0000-0000-0000-000000000003";

	console.log("Creating users...");
	await DrizzleClient.insert(users)
		.values([
			{
				id: adminId,
				username: "ujsquared",
				email: "b323048@iiit-bh.ac.in",
				firstName: "Admin",
				lastName: "User",
				branch: "CSE",
				passingOutYear: "2027",
				totalPosts: 5,
				role: "admin",
			},
			{
				id: userId2,
				username: "arjun_dev",
				email: "b323045@iiit-bh.ac.in",
				firstName: "Arjun",
				lastName: "Patel",
				branch: "CSE",
				passingOutYear: "2028",
				totalPosts: 3,
				role: "user",
			},
			{
				id: userId3,
				username: "priya_cs",
				email: "b323050@iiit-bh.ac.in",
				firstName: "Priya",
				lastName: "Sharma",
				branch: "ECE",
				passingOutYear: "2027",
				totalPosts: 2,
				role: "user",
			},
		])
		.onConflictDoNothing();

	console.log("Creating topics...");
	const [topic1, topic2, topic3, topic4, topic5, topic6, topic7, topic8] =
		await DrizzleClient.insert(topics)
			.values([
				{
					topicName: "General Discussion",
					topicDescription:
						"Chat about anything related to IIIT Bhubaneswar campus life",
					category: "Hub",
					createdBy: adminId,
				},
				{
					topicName: "Academics",
					topicDescription:
						"Discuss courses, professors, exams, and academic life at IIIT-BH",
					category: "Official",
					createdBy: adminId,
				},
				{
					topicName: "Placements & Internships",
					topicDescription:
						"Share experiences, tips, and opportunities for placements and internships",
					category: "Official",
					createdBy: adminId,
				},
				{
					topicName: "Hostel & Mess",
					topicDescription:
						"All things hostel life, mess food, and accommodation",
					category: "Hub",
					createdBy: adminId,
				},
				{
					topicName: "Tech & Coding",
					topicDescription:
						"Programming contests, hackathons, projects, and tech culture at IIIT-BH",
					category: "Hub",
					createdBy: adminId,
				},
				{
					topicName: "Events & Fests",
					topicDescription:
						"Alumni Network, Convocation, and everything in between",
					category: "Official",
					createdBy: adminId,
				},
				{
					topicName: "Buy/Sell/Exchange",
					topicDescription:
						"Marketplace for second-hand books, gadgets, and more",
					category: "Hub",
					createdBy: adminId,
				},
				{
					topicName: "Lost & Found",
					topicDescription: "Report lost items or found items around campus",
					category: "Hub",
					createdBy: adminId,
				},
			])
			.returning();

	console.log("Creating threads...");
	const threadsData = await DrizzleClient.insert(threads)
		.values([
			{
				topicId: topic1.id,
				threadTitle: "Welcome to IIITBuzz! Introduce yourself here",
				viewCount: 42,
				createdBy: adminId,
				pinnedAt: new Date().toISOString(),
				isApproved: true,
			},
			{
				topicId: topic2.id,
				threadTitle: "How's the DSA course this semester?",
				viewCount: 35,
				createdBy: userId2,
				isApproved: true,
			},
			{
				topicId: topic3.id,
				threadTitle: "Amazon internship experience — AMA",
				viewCount: 67,
				createdBy: userId3,
				isApproved: true,
			},
			{
				topicId: topic4.id,
				threadTitle: "New mess menu — thoughts?",
				viewCount: 28,
				createdBy: userId2,
				isApproved: true,
			},
			{
				topicId: topic5.id,
				threadTitle: "Inter-IIIT hackathon team formation",
				viewCount: 15,
				createdBy: adminId,
				isApproved: true,
			},
			{
				topicId: topic1.id,
				threadTitle: "Weekend hangout ideas near campus",
				viewCount: 22,
				createdBy: userId3,
				isApproved: true,
			},
		])
		.returning();

	console.log("Creating posts...");
	const threadWelcome = threadsData[0];
	const threadDSA = threadsData[1];
	const threadAmazon = threadsData[2];
	const threadMess = threadsData[3];
	const threadHackathon = threadsData[4];

	await DrizzleClient.insert(posts).values([
		{
			threadId: threadWelcome.id,
			content:
				"Hey everyone! Welcome to IIITBuzz — our very own campus forum. Feel free to introduce yourself, share ideas, and connect with fellow IIIT-BH students. Let's make this community awesome!",
			vote: 5,
			createdBy: adminId,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadWelcome.id,
			content:
				"Hi! I'm Arjun, 2nd year CSE. Excited to be here! Anyone else prepping for the upcoming hackathon?",
			vote: 2,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadWelcome.id,
			content:
				"Hey all, Priya here from ECE. The library terrace is underrated for studying — great views and zero noise. Also, the canteen chai hits different at 3 AM before exams 😄",
			vote: 3,
			createdBy: userId3,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadDSA.id,
			content:
				"DSA this sem is brutal. Prof Sharma's assignments are no joke. Anyone figured out an efficient approach to the balanced BST problem from last week?",
			vote: 4,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadDSA.id,
			content:
				"Check out the visualizer on USFCA — really helped me understand AVL rotations. Also, the TAs are holding extra office hours on Thursday, definitely worth attending.",
			vote: 3,
			createdBy: userId3,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadAmazon.id,
			content:
				"Got an SDE intern offer from Amazon after 3 rounds. The system design round was the hardest — they asked about designing a URL shortener. Happy to share prep resources!",
			vote: 12,
			createdBy: userId3,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadAmazon.id,
			content:
				"Congrats Priya! Which resources did you use for system design prep? Also, was LeetCode sufficient for the coding rounds?",
			vote: 6,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadMess.id,
			content:
				"The new mess menu has more variety but the portion sizes feel smaller. The dal makhani on Wednesdays is top tier though, not complaining about that.",
			vote: 7,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadMess.id,
			content:
				"Pro tip: breakfast dosa on Saturdays is the best thing about this mess. Fight me on this.",
			vote: 9,
			createdBy: userId3,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadHackathon.id,
			content:
				"Looking for teammates for the Inter-IIIT hackathon! I'm good at backend (Node/Fastify) and DevOps. Need a frontend person and someone strong in ML. DM me!",
			vote: 8,
			createdBy: adminId,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: threadHackathon.id,
			content:
				"I can do React + Tailwind frontend! Also have experience with Three.js if we want something flashy. Count me in 🚀",
			vote: 4,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
	]);

	console.log("Seed complete!");
	console.log("Created 3 users, 8 topics, 6 threads, 11 posts");

	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});

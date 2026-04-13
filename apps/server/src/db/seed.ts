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
				totalPosts: 5,
				role: "admin",
			},
			{
				id: userId2,
				username: "arjun_dev",
				email: "b323045@iiit-bh.ac.in",
				firstName: "Arjun",
				lastName: "Patel",
				totalPosts: 3,
				role: "user",
			},
			{
				id: userId3,
				username: "priya_cs",
				email: "b323050@iiit-bh.ac.in",
				firstName: "Priya",
				lastName: "Sharma",
				totalPosts: 2,
				role: "user",
			},
		])
		.onConflictDoNothing();

	console.log("Creating topics...");
	const [topic1] = await DrizzleClient.insert(topics)
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
					" Alumni Network, Convocation, and everything in between",
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
	const [thread1] = await DrizzleClient.insert(threads)
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
				topicId: topic1.id,
				threadTitle: "Best study spots on campus?",
				viewCount: 28,
				createdBy: userId2,
				isApproved: true,
			},
			{
				topicId: topic1.id,
				threadTitle: "Weekend hangout ideas near campus",
				viewCount: 15,
				createdBy: userId3,
				isAnonymous: false,
				isApproved: true,
			},
		])
		.returning();

	console.log("Creating posts...");
	await DrizzleClient.insert(posts).values([
		{
			threadId: thread1.id,
			content:
				"Hey everyone! Welcome to IIITBuzz — our very own campus forum. Feel free to introduce yourself, share ideas, and connect with fellow IIIT-BH students. Let's make this community awesome!",
			vote: 5,
			createdBy: adminId,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: thread1.id,
			content:
				"Hi! I'm Arjun, 2nd year CSE. Excited to be here! Anyone else prepping for the upcoming hackathon?",
			vote: 2,
			createdBy: userId2,
			isApproved: true,
			isDraft: false,
		},
		{
			threadId: thread1.id,
			content:
				"Hey all, Priya here from ECE. The library terrace is underrated for studying — great views and zero noise. Also, the canteen chai hits different at 3 AM before exams 😄",
			vote: 3,
			createdBy: userId3,
			isApproved: true,
			isDraft: false,
		},
	]);

	console.log("Seed complete!");
	console.log("Created 3 users, 8 topics, 3 threads, 3 posts");

	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});

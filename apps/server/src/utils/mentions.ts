import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { DrizzleClient } from "@/db/index";
import { notifications } from "@/db/schema/notification.schema";
import { users } from "@/db/schema/user.schema";

const USERNAME_PATTERN = "[a-zA-Z0-9_]{3,32}";
const MENTION_REGEX = new RegExp(`(^|[^a-zA-Z0-9_])@(${USERNAME_PATTERN})`, "g");

export function extractMentionedUsernames(content: string) {
	const usernames = new Set<string>();

	for (const match of content.matchAll(MENTION_REGEX)) {
		const username = match[2];
		if (username) {
			usernames.add(username);
		}
	}

	return [...usernames];
}

export async function resolveMentionedUsers(usernamesToResolve: string[]) {
	if (!usernamesToResolve.length) {
		return [];
	}

	return DrizzleClient.query.users.findMany({
		where: (user, { inArray, isNotNull }) =>
			and(inArray(user.username, usernamesToResolve), isNotNull(user.username)),
		columns: {
			id: true,
			username: true,
		},
	});
}

interface CreateMentionNotificationsInput {
	content: string;
	fromUserId: string;
	threadId: string;
	excludeUserIds?: string[];
}

export async function createMentionNotifications({
	content,
	fromUserId,
	threadId,
	excludeUserIds = [],
}: CreateMentionNotificationsInput) {
	const mentionedUsernames = extractMentionedUsernames(content);
	const mentionedUsers = await resolveMentionedUsers(mentionedUsernames);
	const excludedUserIds = new Set([...excludeUserIds, fromUserId]);
	const validMentionedUsers = mentionedUsers.filter(
		(user) => user.id && !excludedUserIds.has(user.id),
	);

	if (!validMentionedUsers.length) {
		return [];
	}

	await DrizzleClient.insert(notifications).values(
		validMentionedUsers.map((user) => ({
			userId: user.id,
			type: "mention",
			threadId,
			fromUserId,
			message: "mentioned you in a post",
		})),
	);

	return validMentionedUsers;
}

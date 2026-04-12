import { z } from "zod";
import type { notifications } from "@/db/schema/notification.schema";

export type Notification = typeof notifications.$inferSelect;

export const markReadSchema = z.object({
	notificationIds: z.array(z.string().uuid()).optional(),
});

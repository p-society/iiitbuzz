import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { Link } from "react-router";

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

export function NotificationBell() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await api.getNotifications();
				setNotifications(res.notifications);
				setUnreadCount(res.unreadCount);
			} catch {
				// silently fail
			}
		};
		fetchNotifications();
		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const markAllRead = async () => {
		try {
			await api.markNotificationsRead();
			setUnreadCount(0);
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		} catch {
			// silently fail
		}
	};

	const formatTime = (dateStr: string) => {
		const now = new Date();
		const date = new Date(dateStr);
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${Math.floor(diffHours / 24)}d ago`;
	};

	return (
		<div className="relative" ref={panelRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-1 border-2 border-black bg-card neo-brutal-button"
			>
				<Bell className="h-4 w-4" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-black">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 top-8 w-72 border-4 border-black bg-card shadow-[4px_4px_0px_0px_var(--shadow-color)] z-50">
					<div className="flex justify-between items-center border-b-2 border-black p-2">
						<span className="font-black text-xs uppercase">Notifications</span>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllRead}
								className="text-[10px] font-bold hover:underline"
							>
								Mark all read
							</button>
						)}
					</div>
					<div className="max-h-60 overflow-y-auto">
						{notifications.length === 0 ? (
							<p className="text-center text-xs text-muted-foreground p-4">
								No notifications
							</p>
						) : (
							notifications.map((n) => (
								<Link
									key={n.id}
									to={n.threadId ? `/thread/${n.threadId}` : "#"}
									onClick={() => setIsOpen(false)}
									className={`block p-2 border-b border-black/10 hover:bg-muted/30 ${!n.read ? "bg-muted/50" : ""}`}
								>
									<div className="text-xs font-bold">
										{n.type === "reply" ? "💬" : "🔔"}{" "}
										{n.fromUsername || "Someone"} {n.message || "interacted"}
									</div>
									{n.threadTitle && (
										<div className="text-[10px] text-muted-foreground truncate">
											in {n.threadTitle}
										</div>
									)}
									<div className="text-[10px] text-muted-foreground">
										{formatTime(n.createdAt)}
									</div>
								</Link>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

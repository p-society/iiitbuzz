import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, X, MessageSquare, Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateIST } from "@/lib/utils/date";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { AdminThread } from "@/lib/api";
import { toast } from "sonner";

type Tab = "pending" | "approved" | "rejected";

export default function AdminPage() {
	const { isAdmin, isAuthenticated, isLoading } = useAuth();
	const [activeTab, setActiveTab] = useState<Tab>("pending");
	const [threads, setThreads] = useState<AdminThread[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchThreads = useCallback(async () => {
		setLoading(true);
		try {
			let res: { success: boolean; threads: AdminThread[] };
			if (activeTab === "pending") res = await api.getPendingThreads();
			else if (activeTab === "approved") res = await api.getApprovedThreads();
			else res = await api.getRejectedThreads();
			setThreads(res.threads);
		} catch (_err) {
			toast.error("Failed to load threads");
		} finally {
			setLoading(false);
		}
	}, [activeTab]);

	useEffect(() => {
		if (isAuthenticated && isAdmin) fetchThreads();
	}, [fetchThreads, isAuthenticated, isAdmin]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<p className="font-bold">Loading...</p>
				</main>
				<Footer />
			</div>
		);
	}

	if (!isAuthenticated || !isAdmin) {
		return (
			<div className="min-h-screen flex flex-col bg-background">
				<Header />
				<main className="site-container flex-1 flex flex-col items-center justify-center gap-4">
					<div className="neo-brutal-card p-8 text-center border-4 border-black">
						<Ban className="h-12 w-12 mx-auto mb-3 text-destructive" />
						<h1 className="font-black text-2xl mb-2">Access Denied</h1>
						<p className="text-muted-foreground text-sm">
							You need admin privileges to access this page.
						</p>
						<p className="text-muted-foreground text-xs mt-1">
							If you believe this is an error, contact a site administrator.
						</p>
					</div>
					<Link to="/home">
						<Button variant="neutral" className="neo-brutal-button">
							Back to Home
						</Button>
					</Link>
				</main>
				<Footer />
			</div>
		);
	}

	const handleApprove = async (id: string) => {
		try {
			await api.approveThread(id);
			toast.success("Thread approved");
			fetchThreads();
		} catch (_err) {
			toast.error("Failed to approve thread");
		}
	};

	const handleReject = async (id: string) => {
		try {
			await api.rejectThread(id);
			toast.success("Thread rejected");
			fetchThreads();
		} catch (_err) {
			toast.error("Failed to reject thread");
		}
	};

	const tabConfig: {
		key: Tab;
		label: string;
		icon: React.ReactNode;
		color: string;
	}[] = [
		{
			key: "pending",
			label: "Pending",
			icon: <MessageSquare className="h-3 w-3" />,
			color: "bg-yellow-400",
		},
		{
			key: "approved",
			label: "Approved",
			icon: <Check className="h-3 w-3" />,
			color: "bg-green-400",
		},
		{
			key: "rejected",
			label: "Rejected",
			icon: <X className="h-3 w-3" />,
			color: "bg-red-400",
		},
	];

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<div className="site-container">
				<Breadcrumbs
					items={[{ label: "Home", href: "/home" }, { label: "Admin" }]}
				/>
			</div>

			<main className="site-container flex-1 py-3">
				<div className="page-header mb-3">
					<h1 className="font-black text-xl">Admin Panel</h1>
					<p className="text-xs text-muted-foreground">
						Manage anonymous thread approvals
					</p>
				</div>

				<div className="flex gap-1 mb-3">
					{tabConfig.map((tab) => (
						<Button
							key={tab.key}
							variant={activeTab === tab.key ? "default" : "neutral"}
							onClick={() => setActiveTab(tab.key)}
							className="neo-brutal-button text-xs py-1 px-3 flex items-center gap-1"
						>
							{tab.icon}
							{tab.label}
						</Button>
					))}
				</div>

				<div className="neo-brutal-card space-y-0 border-4 border-black">
					{loading ? (
						<p className="text-center py-4 font-bold text-sm">Loading...</p>
					) : threads.length === 0 ? (
						<p className="text-center py-4 font-bold text-sm">
							No {activeTab} threads
						</p>
					) : (
						threads.map((thread, idx) => (
							<div
								key={thread.id}
								className={
									idx !== threads.length - 1 ? "border-b-2 border-black" : ""
								}
							>
								<div className="flex items-center gap-3 py-3 px-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-1 mb-0.5">
											<span className="rounded border border-black bg-yellow-400 px-1 py-0 font-bold text-[10px] text-black uppercase">
												ANON
											</span>
											<span className="text-[10px] text-muted-foreground">
												in {thread.topicName}
											</span>
										</div>
										<h3 className="font-bold text-sm truncate">
											{thread.threadTitle}
										</h3>
										<p className="text-[10px] text-muted-foreground">
											by {thread.authorName || "Anonymous"} ·{" "}
											{formatDateIST(thread.createdAt)}
										</p>
									</div>

									<div className="flex items-center gap-1 flex-shrink-0">
										{activeTab === "pending" && (
											<>
												<Button
													variant="neutral"
													size="sm"
													className="neo-brutal-button bg-green-400 text-black font-bold text-[10px] h-7 px-2"
													onClick={() => handleApprove(thread.id)}
												>
													<Check className="h-3 w-3 mr-1" />
													Approve
												</Button>
												<Button
													variant="neutral"
													size="sm"
													className="neo-brutal-button bg-red-400 text-black font-bold text-[10px] h-7 px-2"
													onClick={() => handleReject(thread.id)}
												>
													<X className="h-3 w-3 mr-1" />
													Reject
												</Button>
											</>
										)}
										{activeTab === "approved" && (
											<Link to={`/thread/${thread.id}`}>
												<Button
													variant="neutral"
													size="sm"
													className="neo-brutal-button bg-card font-bold text-[10px] h-7 px-2"
												>
													<Eye className="h-3 w-3 mr-1" />
													View
												</Button>
											</Link>
										)}
										{activeTab === "rejected" && (
											<Button
												variant="neutral"
												size="sm"
												className="neo-brutal-button bg-green-400 text-black font-bold text-[10px] h-7 px-2"
												onClick={() => handleApprove(thread.id)}
											>
												<Check className="h-3 w-3 mr-1" />
												Re-approve
											</Button>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}

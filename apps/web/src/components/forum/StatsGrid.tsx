import type { ForumStats } from "@/types/forum";

export const StatsGrid = ({ stats }: { stats: ForumStats }) => {
	return (
		<div className="mt-8 sm:mt-12 grid gap-0 sm:grid-cols-3">
			<div className="border border-black p-4 sm:p-6 text-center">
				<div className="mono-label mb-2">STAT :: TOPICS</div>
				<div className="font-black text-3xl sm:text-4xl tracking-tighter">
					{stats.totalTopics}
				</div>
			</div>
			<div className="border border-black p-4 sm:p-6 text-center">
				<div className="mono-label mb-2">STAT :: POSTS</div>
				<div className="font-black text-3xl sm:text-4xl tracking-tighter">
					{stats.totalPosts}
				</div>
			</div>
			<div className="border border-black p-4 sm:p-6 text-center">
				<div className="mono-label mb-2">STAT :: MEMBERS</div>
				<div className="font-black text-3xl sm:text-4xl tracking-tighter">
					{stats.totalMembers}
				</div>
			</div>
		</div>
	);
};

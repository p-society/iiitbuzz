import type { ForumStats } from "@/types/forum";

export const StatsGrid = ({ stats }: { stats: ForumStats }) => {
    return (
        <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-3">
            <div className="neo-brutal-card bg-primary text-primary-foreground p-4 sm:p-6">
                <div className="font-bold text-3xl sm:text-4xl">{stats.totalTopics}</div>
                <div className="mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Total Topics
                </div>
            </div>
            <div className="neo-brutal-card bg-secondary text-secondary-foreground p-4 sm:p-6">
                <div className="font-bold text-3xl sm:text-4xl">{stats.totalPosts}</div>
                <div className="mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Total Posts
                </div>
            </div>
            <div className="neo-brutal-card bg-accent text-accent-foreground p-4 sm:p-6">
                <div className="font-bold text-3xl sm:text-4xl">{stats.totalMembers}</div>
                <div className="mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Members
                </div>
            </div>
        </div>
    );
};
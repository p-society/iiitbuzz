interface StatCardProps {
    label: string;
    value: number | string;
    color: "primary" | "secondary" | "accent" | "muted";
}

const colorMap = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
};

export const StatCard = ({ label, value, color }: StatCardProps) => (
    <div className={`border-3 border-border ${colorMap[color]} p-3 sm:p-4 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)]`}>
        <div className="font-bold text-2xl sm:text-3xl">{value}</div>
        <div className="mt-1 font-bold text-[10px] sm:text-xs uppercase">{label}</div>
    </div>
);
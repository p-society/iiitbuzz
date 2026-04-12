import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<nav className="neo-breadcrumbs px-4 py-2 flex items-center gap-1 text-sm font-bold overflow-x-auto">
			<Link to="/home" className="flex items-center hover:underline">
				<Home className="h-4 w-4" />
			</Link>
			{items.map((item, index) => (
				<span key={index} className="flex items-center gap-1">
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
					{item.href ? (
						<Link to={item.href} className="hover:underline whitespace-nowrap">
							{item.label}
						</Link>
					) : (
						<span className="text-muted-foreground whitespace-nowrap">
							{item.label}
						</span>
					)}
				</span>
			))}
		</nav>
	);
}

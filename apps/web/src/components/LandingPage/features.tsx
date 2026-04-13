import { Link } from "react-router";
import {
	MessageSquare,
	HelpCircle,
	Calendar,
	BookOpen,
	ArrowRight,
	Users,
	Flame,
} from "lucide-react";

const features = [
	{
		key: "discussion-boards",
		icon: MessageSquare,
		title: "Discussion Boards",
		description:
			"Engage in meaningful conversations about academics, projects, and campus life with your peers.",
		stamp: "CATEGORY :: 01",
		accent: "var(--accent-green)",
		accentBarClass: "accent-bar-green",
	},
	{
		key: "qa-sections",
		icon: HelpCircle,
		title: "Q&A Sections",
		description:
			"Get quick answers to your questions from seniors, peers, and subject experts.",
		stamp: "CATEGORY :: 02",
		accent: "var(--accent-blue)",
		accentBarClass: "accent-bar-blue",
	},
	{
		key: "event-announcements",
		icon: Calendar,
		title: "Event Announcements",
		description:
			"Stay updated with the latest campus events, workshops, and important announcements.",
		stamp: "CATEGORY :: 03",
		accent: "var(--accent-yellow)",
		accentBarClass: "accent-bar-yellow",
	},
	{
		key: "study-resources",
		icon: BookOpen,
		title: "Study Resources",
		description:
			"Access shared notes, previous year papers, and study materials contributed by the community.",
		stamp: "CATEGORY :: 04",
		accent: "var(--accent-red)",
		accentBarClass: "accent-bar-red",
	},
];

const stats = [
	{ label: "ACTIVE USERS", value: "1.2K+", icon: Users },
	{ label: "DISCUSSIONS", value: "340+", icon: MessageSquare },
	{ label: "TRENDING", value: "24/7", icon: Flame },
];

const FeaturesPage = () => {
	return (
		<section
			id="features"
			className="py-20 lg:py-28 bg-[#fafafa] relative overflow-hidden border-b-[1.5px] border-black"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-16">
					<div className="flex items-center gap-3 mb-3">
						<span className="tech-stamp">FEATURES</span>
						<div className="h-[1px] flex-1 bg-black" />
					</div>
					<h2 className="heading-brutal text-4xl tracking-tight">
						POWER-UP YOUR
						<br />
						COLLEGE EXPERIENCE
					</h2>
					<p className="body-brutal mt-3 max-w-lg" style={{ color: "#6b7280" }}>
						Level up your academic journey with features designed for the modern
						IIIT student
					</p>
				</div>

				<div className="feature-grid">
					{features.map((feature, idx) => (
						<Link
							to="/comingsoon"
							key={feature.key}
							className="feature-grid-item group"
						>
							<div
								className={`h-full flex flex-col ${feature.accentBarClass}`}
								style={{ paddingLeft: "2rem" }}
							>
								<div className="flex items-center justify-between mb-4">
									<span
										className="mono-label"
										style={{ fontSize: "0.6rem", color: feature.accent }}
									>
										{feature.stamp}
									</span>
								</div>
								<h3
									className="heading-brutal text-xl tracking-tight mb-2"
									style={{
										hyphens: "auto",
										overflowWrap: "break-word",
										wordBreak: "break-word",
									}}
								>
									{feature.title}
								</h3>
								<p className="body-brutal text-sm flex-1">
									{feature.description}
								</p>
								<div
									className="mt-4 pt-3 flex items-center gap-1"
									style={{ borderTop: "1px solid #e5e7eb" }}
								>
									<span
										className="mono-label"
										style={{ fontSize: "0.6rem", color: feature.accent }}
									>
										EXPLORE
									</span>
									<ArrowRight
										className="w-3 h-3"
										style={{ color: feature.accent }}
									/>
								</div>
							</div>
							<div
								className="feature-icon"
								style={{
									position: "absolute",
									top: "-1px",
									right: "-1px",
									background: `${feature.accent}15`,
									width: "36px",
									height: "36px",
									boxShadow: "none",
									borderLeft: "1px solid #000000",
									borderBottom: "1px solid #000000",
									borderTop: "none",
									borderRight: "none",
									zIndex: 2,
								}}
							>
								<feature.icon
									className="w-4 h-4"
									strokeWidth={1.5}
									style={{ color: feature.accent }}
								/>
							</div>
						</Link>
					))}
				</div>

				<div className="mt-16">
					<div
						style={{
							display: "flex",
							borderTop: "1px solid #000000",
							borderBottom: "1px solid #000000",
						}}
					>
						{stats.map((stat, idx) => (
							<div
								key={stat.label}
								className="text-center"
								style={{
									flex: "1 1 0%",
									padding: "1.5rem",
									borderRight:
										idx < stats.length - 1 ? "1px solid #000000" : "none",
									borderLeft: idx > 0 ? "none" : "none",
									boxSizing: "border-box",
								}}
							>
								<stat.icon
									className="w-4 h-4 mx-auto mb-2"
									strokeWidth={1.5}
									style={{ color: "#6b7280" }}
								/>
								<div className="heading-brutal text-2xl sm:text-3xl tracking-tighter mb-1">
									{stat.value}
								</div>
								<span className="mono-label">{stat.label}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeaturesPage;

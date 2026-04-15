import { Link } from "react-router";
import {
	MessageSquare,
	HelpCircle,
	Calendar,
	BookOpen,
	ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const quickLinks = [
	{
		label: "DISCUSSIONS",
		icon: MessageSquare,
		accent: "var(--accent-green)",
		stamp: "01",
	},
	{ label: "Q&A", icon: HelpCircle, accent: "var(--accent-blue)", stamp: "02" },
	{
		label: "EVENTS",
		icon: Calendar,
		accent: "var(--accent-yellow)",
		stamp: "03",
	},
	{
		label: "RESOURCES",
		icon: BookOpen,
		accent: "var(--accent-red)",
		stamp: "04",
	},
];

const Hero = () => {
	const { isAuthenticated } = useAuth();
	const forumRoute = isAuthenticated ? "/home" : "/login";
	const browseRoute = isAuthenticated ? "/threads" : "/login";

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b-[1.5px] border-black">
			<div className="absolute inset-0 bg-white z-0" />
			<div
				className="absolute inset-0 z-[1] opacity-[0.04]"
				style={{
					backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
					backgroundSize: "16px 16px",
				}}
			/>

			<div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
				<div className="text-center">
					<div className="fade-in-up mb-6">
						<span className="tech-stamp">FORUM :: v1.0</span>
					</div>

					<h1
						className="heading-brutal text-5xl sm:text-7xl lg:text-8xl tracking-tighter mb-6 fade-in-up"
						style={{ lineHeight: 0.9 }}
					>
						IIIT
						<span
							className="inline-block bg-black text-white px-3 py-1 transform rotate-1"
							style={{ marginLeft: "4px" }}
						>
							BUZZ
						</span>
					</h1>

					<div className="fade-in-up-delay-1 mb-10">
						<p
							className="heading-brutal text-lg sm:text-xl tracking-tight mb-3"
							style={{ fontWeight: 800 }}
						>
							CONNECT &middot; LEARN &middot; WIN &middot; REPEAT
						</p>
					</div>

					<div className="fade-in-up-delay-2 flex justify-center mb-10">
						<div className="max-w-xl w-full border-[1.5px] border-black">
							<div className="border-b-[1.5px] border-black bg-[#fafafa] px-4 py-2 flex items-center justify-between">
								<span className="mono-label">ABOUT</span>
								<span className="mono-label" style={{ color: "#000000" }}>
									INSTITUTE FORUM
								</span>
							</div>
							<div className="p-6 bg-white">
								<p className="body-brutal text-base sm:text-lg mb-3">
									<strong>
										The ultimate community forum for IIIT students.
									</strong>
								</p>
								<p className="body-brutal text-sm">
									Connect, collaborate, and conquer your academic journey with
									fellow IIITians. Your digital campus hub for discussions,
									resources, and everything in between.
								</p>
							</div>
						</div>
					</div>

					<div className="fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
						<Link to={forumRoute}>
							<button
								type="button"
								className="landing-button landing-button-primary"
							>
								{isAuthenticated ? "GO TO HOME" : "LOGIN WITH IIIT MAIL"}
								<ArrowRight className="w-4 h-4" />
							</button>
						</Link>
						{isAuthenticated && (
							<Link to={browseRoute}>
								<button
									type="button"
									className="landing-button landing-button-secondary"
								>
									EXPLORE THREADS
									<ArrowRight className="w-4 h-4" />
								</button>
							</Link>
						)}
					</div>

					<div className="fade-in-up-delay-4">
						<div className="flex justify-center mb-6">
							<span className="mono-label" style={{ color: "#9ca3af" }}>
								&#x2500;&#x2500; CATEGORIES &#x2500;&#x2500;
							</span>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
							{quickLinks.map((link) => (
								<Link
									key={link.label}
									to={isAuthenticated ? "/home" : "/login"}
									className="landing-card p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#fafafa]"
								>
									<span className="mono-label" style={{ fontSize: "0.55rem" }}>
										[ :: {link.stamp} ]
									</span>
									<div
										className="feature-icon"
										style={{ background: `${link.accent}15` }}
									>
										<link.icon
											className="w-5 h-5"
											strokeWidth={1.5}
											style={{ color: link.accent }}
										/>
									</div>
									<span className="mono-label" style={{ color: "#000000" }}>
										{link.label}
									</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

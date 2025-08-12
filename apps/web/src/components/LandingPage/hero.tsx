import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const Bee = () => {
	return (
		<div className="bee-container">
			<div className="bee-body">
				<div className="body"></div>
				<div className="wing1"></div>
				<div className="wing2"></div>
				<div className="stinger"></div>
				<div className="eyes">
					<div className="pupil"></div>
				</div>
			</div>
		</div>
	);
};

const Hero = () => {
	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />

			<div className="container mx-auto px-4 text-center relative z-20">
				<div className="max-w-4xl mx-auto fade-in-up">
					<div className="flex justify-center mb-8 space-x-4">
						<div className="w-16 h-16 neo-brutal-card bg-green-200 border-green-500 flex items-center justify-center avatar-float">
							<img src="/images/avatar1.png" alt="Avatar1" />
						</div>
						<div
							className="w-16 h-16 neo-brutal-card bg-blue-200 border-blue-500 flex items-center justify-center avatar-float"
							style={{ animationDelay: "0.5s" }}
						>
							<img src="/images/avatar2.png" alt="Avatar2" />
						</div>
						<div
							className="w-16 h-16 neo-brutal-card bg-yellow-200 border-yellow-500 flex items-center justify-center avatar-float"
							style={{ animationDelay: "1s" }}
						>
							<img src="/images/avatar3.png" alt="Avatar3" />
						</div>
						<div
							className="w-16 h-16 neo-brutal-card bg-purple-200 border-purple-500 flex items-center justify-center avatar-float"
							style={{ animationDelay: "1.5s" }}
						>
							<img src="/images/avatar4.png" alt="Avatar4" />
						</div>
					</div>

					<div className="flex justify-center items-center gap-4 mb-6">
						<h1
							className="pixel-font text-4xl md:text-6xl lg:text-7xl glitch-text font-bold text-primary ghibli-title"
							data-text="IIITBuzz"
						>
							IIITBuzz
						</h1>
						<Bee />
					</div>

					<p className="text-2xl md:text-3xl  mb-8 text-primary font-bold ghibli-title pixel-font">
						CONNECT • LEARN • WIN • REPEAT
					</p>

					<div className="neo-brutal-card p-8 mb-8 max-w-2xl mx-auto ghibli-card ">
						<p className="text-lg md:text-xl mb-4 text-foreground pixel-font">
							<b> 🎓 The ultimate community forum for IIIT students!</b>
						</p>
						<p className="text-muted-foreground public-sans-font">
							Connect, collaborate, and conquer your academic journey with
							fellow IIITians. Your digital campus hub for discussions,
							resources, and everything in between.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up">
						<Link to="/login">
							<Button
								size="lg"
								className="neo-brutal-button bg-foreground text-black hover:bg-primary/90 border-primary text-lg px-8 py-6 ghibli-button pixel-font"
							>
								🚀 JOIN THE BUZZ
							</Button>
						</Link>
						<Link to="/home">
							<Button
								size="lg"
								variant="outline"
								className="neo-brutal-button bg-secondary border-primary text-primary hover:bg-secondary  hover:text-black text-lg px-8 py-6 ghibli-button pixel-font"
							>
								📖 EXPLORE FIRST
							</Button>
						</Link>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto fade-in-up">
						<div className="neo-brutal-card p-4 bg-primary-20 border-foreground ghibli-feature-card">
							<div className="text-2xl mb-2">💬</div>
							<div className="pixel-font text-xs text-foreground">
								DISCUSSIONS
							</div>
						</div>
						<div
							className="neo-brutal-card p-4 bg-secondary-20 border-secondary ghibli-feature-card"
							style={{ animationDelay: "0.2s" }}
						>
							<div className="text-2xl mb-2">❓</div>
							<div className="pixel-font text-xs text-secondary">Q&A</div>
						</div>
						<div
							className="neo-brutal-card p-4 bg-accent-20 border-accent ghibli-feature-card"
							style={{ animationDelay: "0.4s" }}
						>
							<div className="text-2xl mb-2">📅</div>
							<div className="pixel-font text-xs text-accent">EVENTS</div>
						</div>
						<div
							className="neo-brutal-card p-4 bg-destructive-20 border-destructive ghibli-feature-card"
							style={{ animationDelay: "0.6s" }}
						>
							<div className="text-2xl mb-2">📚</div>
							<div className="pixel-font text-xs text-destructive">
								RESOURCES
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

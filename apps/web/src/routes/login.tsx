import Footer from "@/components/LandingPage/footer";
import Header from "@/components/LandingPage/header";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	const redirectToGoogle = () => {
		window.location.assign("/auth/google");
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1">
				<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />

					<div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
						<div
							className="absolute top-10 left-10 w-2 h-2 bg-accent rounded-full animate-bounce"
							style={{ animationDelay: "0s", animationDuration: "3s" }}
						></div>
						<div
							className="absolute top-20 right-20 w-1 h-1 bg-primary rounded-full animate-bounce"
							style={{ animationDelay: "1s", animationDuration: "4s" }}
						></div>
						<div
							className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
							style={{ animationDelay: "2s", animationDuration: "5s" }}
						></div>
						<div
							className="absolute bottom-20 right-10 w-2 h-2 bg-accent rounded-full animate-bounce"
							style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
						></div>
						<div
							className="absolute bottom-40 left-16 w-1 h-1 bg-primary rounded-full animate-bounce"
							style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
						></div>
					</div>

					<div className="absolute inset-0 opacity-10 pixel-pattern z-10"></div>

					<div className="container mx-auto px-4 text-center relative z-20">
						<div className="max-w-3xl mx-auto fade-in-up">
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

							<h1
								className="pixel-font text-4xl md:text-5xl lg:text-6xl mb-6 glitch-text font-bold text-primary ghibli-title"
								data-text="Welcome"
							>
								Welcome
							</h1>

							<p className="text-2xl md:text-3xl mb-8 text-primary font-bold ghibli-title">
								Login to join the buzz
							</p>

							<div className="neo-brutal-card p-8 mb-8 max-w-xl mx-auto ghibli-card">
								<p className="text-lg md:text-xl mb-4 text-foreground para-text-font">
									🎯 Sign in with your Google account to access discussions,
									events, and resources
								</p>
								<p className="text-muted-foreground para-text-font">
									Your digital campus hub is just a click away.
								</p>
							</div>

							<Button
								size="lg"
								onClick={redirectToGoogle}
								className="neo-brutal-button bg-foreground text-black hover:bg-primary/90 border-primary text-lg px-8 py-6 ghibli-button"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 533.5 544.3"
									className="w-5 h-5"
                                    role="img"
                                    aria-label="google-icon-title"
								>
									<path
										fill="#4285f4"
										d="M533.5 278.4c0-17.8-1.5-35-4.4-51.6H272v97.7h146.9c-6.4 34.5-25 63.7-53.5 83.2v68h86.5c50.7-46.7 81.6-115.4 81.6-197.3z"
									/>
									<path
										fill="#34a853"
										d="M272 544.3c72.4 0 133-24 177.3-65.5l-86.5-68c-24 16.1-54.6 25.7-90.8 25.7-69.8 0-128.9-47.1-150.2-110.4h-89.4v69.4C85 477.1 170.5 544.3 272 544.3z"
									/>
									<path
										fill="#fbbc04"
										d="M121.8 326.1c-10-30-10-62.4 0-92.4v-69.4H32.4c-38.7 77.5-38.7 170.7 0 248.2l89.4-69.4z"
									/>
									<path
										fill="#ea4335"
										d="M272 107.7c39.4 0 74.8 13.6 102.5 40.3l76.8-76.8C405 24 344.4 0 272 0 170.5 0 85 67.2 32.4 164.3l89.4 69.4C143.1 154.8 202.2 107.7 272 107.7z"
									/>
								</svg>
								Login with Google
							</Button>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

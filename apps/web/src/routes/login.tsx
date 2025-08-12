import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";

export default function LoginPage() {
	const redirectToGoogle = () => {
		const backendUrl =
			import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
		const fullUrl = `${backendUrl}/auth/google`;
		window.location.assign(fullUrl);
	};

	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex-1">
				<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />

					<div className="container mx-auto px-4 text-center relative z-20">
						<div className="max-w-3xl mx-auto fade-in-up">
							<h1
								className="pixel-font text-4xl md:text-5xl lg:text-6xl mb-6 font-bold text-primary "
								data-text="Welcome"
							>
								Welcome
							</h1>

							<p className="text-2xl md:text-3xl mb-8 text-primary font-bold ">
								Login to join the buzz
							</p>

							<div className="neo-brutal-card p-8 mb-8 max-w-xl mx-auto ghibli-card">
								<p className="text-lg md:text-xl mb-4 text-foreground public-sans-font">
									🎯 Sign in with your Google account to access discussions,
									events, and resources
								</p>
								<p className="text-muted-foreground public-sans-font">
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

import FeaturesPage from "@/components/LandingPage/features";
import Hero from "@/components/LandingPage/hero";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";

export default function HomePage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="relative flex-1">
				<main className="relative z-10">
					<Hero />
					<FeaturesPage />
				</main>
			</div>
			<Footer />
		</div>
	);
}

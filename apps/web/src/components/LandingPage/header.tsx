import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle";

const Header = () => {
	return (
		<header className="border-b-4 border-primary bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link to="/" className="flex items-center space-x-2">
					<img
						src="/images/logo.png"
						alt="IIITBuzz Logo"
						className="w-8 h-8"
					/>
					<h1 className="pixel-font text-xl text-primary">IIITBuzz</h1>
				</Link>

				<div className="flex items-center space-x-3">
					<ModeToggle />
					<Link to="/login">
						<Button
							variant="outline"
							className="neo-brutal-button border-primary text-primary bg-secondary hover:bg-secondary hover:text-black"
						>
							Log In
						</Button>
					</Link>
					<Link to="/signup">
						<Button className="neo-brutal-button bg-foreground text-primary hover:bg-primary/90 border-foreground">
							Sign Up
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
};

export default Header;

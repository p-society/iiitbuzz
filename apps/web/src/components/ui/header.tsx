import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
	const { user, isLoading, isAuthenticated, login, logout } = useAuth();

	return (
		<header className="border-b-4 border-primary bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link to="/" className="flex items-center space-x-2">
					<img src="/images/logo.png" alt="IIITBuzz Logo" className="w-8 h-8" />
					<h1 className="pixel-font text-xl text-primary">IIITBuzz</h1>
				</Link>

				<div className="flex items-center space-x-3">
					<ModeToggle />

					{isLoading ? (
						// Show loading state
						<div className="animate-pulse text-sm text-muted-foreground">
							Loading...
						</div>
					) : isAuthenticated ? (
						// Show authenticated user options
						<>
							<span className="text-sm text-foreground">
								Welcome, {user?.firstName || user?.username || user?.email}!
							</span>
							<Link
								to={
									user?.username ? `/profile/${user.username}` : "/my/profile"
								}
							>
								<Button
									variant="outline"
									className="neo-brutal-button border-primary text-primary bg-secondary hover:bg-secondary hover:text-black"
								>
									My Profile
								</Button>
							</Link>
							<Button
								onClick={logout}
								className="neo-brutal-button bg-foreground text-primary hover:bg-primary/90 border-foreground"
							>
								Logout
							</Button>
						</>
					) : (
						// Show unauthenticated user options (current state)
						<>
							<Button
								onClick={login}
								variant="outline"
								className="neo-brutal-button border-primary text-primary bg-secondary hover:bg-secondary hover:text-black"
							>
								Log In
							</Button>
							<Button
								onClick={login}
								className="neo-brutal-button bg-foreground text-primary hover:bg-primary/90 border-foreground"
							>
								Sign Up
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;

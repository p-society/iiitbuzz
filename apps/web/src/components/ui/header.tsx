import { Link } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

import ProfileDropdown from "@/components/profile-dropdown"
import { Home, Plus } from "lucide-react";

interface HeaderProps {
	hideThemeToggle?: boolean;
}

const Header = ({ hideThemeToggle = false }: HeaderProps) => {
	const { user, isLoading, isAuthenticated, login, logout } = useAuth();

	return (
		<header className="border-b-4 border-primary bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link to="/" className="flex items-center space-x-2">
					<img src="/images/logo.png" alt="IIITBuzz Logo" className="w-8 h-8" />
					<h1 className="pixel-font text-xl text-primary">IIITBuzz</h1>
				</Link>

				<div className="flex items-center space-x-3">
					{!hideThemeToggle && <ModeToggle />}

					{isLoading ? (
						<div className="animate-pulse text-sm text-muted-foreground">
							Loading...
						</div>
					) : isAuthenticated ? (
						<>
							{!hideThemeToggle && (
                                <Link to="/home">
                                    <Button
                                        type="button"
                                        variant="neutral"
                                        className="border-3 flex items-center gap-2 border-border text-primary bg-card px-4 py-2 font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                    >
                                        <Home className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
							<ProfileDropdown/>
							{!hideThemeToggle && (
                                <Link 
                                    to="/new-thread" 
                                    className="neo-brutal-button bg-primary px-1.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 font-bold text-primary-foreground text-xs sm:text-sm shadow-[2px_2px_0px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                                >
                                    <Plus className="h-4 w-4" />
                                    
                                    <span className="inline">New Thread</span>
                                </Link>
                            )}

							
							
						</>
					) : (
						<>
							<Button
								onClick={login}
								variant="neutral"
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

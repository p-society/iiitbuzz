import { Link } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/ui/notification-bell";
import ProfileDropdown from "@/components/profile-dropdown";
import { Home, Plus, Shield } from "lucide-react";

interface HeaderProps {
	hideThemeToggle?: boolean;
}

const Header = ({ hideThemeToggle = false }: HeaderProps) => {
	const { user, isLoading, isAuthenticated, isAdmin, login } = useAuth();

	return (
		<header className="border-b-4 border-primary bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="site-container py-3 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<img src="/images/logo.png" alt="IIITBuzz Logo" className="w-7 h-7" />
					<h1 className="pixel-font text-lg text-primary">IIITBuzz</h1>
				</Link>

				<div className="flex items-center gap-2">
					{!hideThemeToggle && <ModeToggle />}

					{isLoading ? (
						<div className="animate-pulse text-xs text-muted-foreground">
							...
						</div>
					) : isAuthenticated ? (
						<>
							{!hideThemeToggle && (
								<Link to="/home">
									<Button
										type="button"
										variant="neutral"
										className="border-2 flex items-center gap-1 border-border text-primary bg-card px-2 py-1 font-bold text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]"
									>
										<Home className="h-3 w-3" />
									</Button>
								</Link>
							)}
							{isAdmin && (
								<Link to="/admin">
									<Button
										type="button"
										variant="neutral"
										className="border-2 flex items-center gap-1 border-border text-primary bg-card px-2 py-1 font-bold text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]"
									>
										<Shield className="h-3 w-3" />
										<span className="hidden sm:inline">Admin</span>
									</Button>
								</Link>
							)}
							<NotificationBell />
							<ProfileDropdown />
							{!hideThemeToggle && (
								<Link
									to="/new-thread"
									className="neo-brutal-button bg-primary px-2 py-1 flex items-center gap-1 font-bold text-primary-foreground text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]"
								>
									<Plus className="h-3 w-3" />
									<span className="hidden sm:inline">New</span>
								</Link>
							)}
						</>
					) : (
						<>
							<Button
								onClick={login}
								variant="neutral"
								className="neo-brutal-button border-primary text-primary bg-secondary text-xs px-2 py-1"
							>
								Log In
							</Button>
							<Button
								onClick={login}
								className="neo-brutal-button bg-foreground text-primary hover:bg-primary/90 border-foreground text-xs px-2 py-1"
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

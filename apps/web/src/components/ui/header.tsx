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
		<header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="site-container py-3 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<img src="/images/logo.png" alt="IIITBuzz Logo" className="w-7 h-7" />
					<h1 className="font-black text-lg text-foreground tracking-tight">
						IIITBuzz
					</h1>
				</Link>

				<div className="flex items-center gap-2">
					{!hideThemeToggle && <ModeToggle />}

					{isLoading ? (
						<div className="animate-pulse mono-meta">...</div>
					) : isAuthenticated ? (
						<>
							{!hideThemeToggle && (
								<Link to="/home">
									<Button
										type="button"
										variant="neutral"
										className="flex items-center gap-1 px-2 py-1 text-xs font-bold"
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
										className="flex items-center gap-1 px-2 py-1 text-xs font-bold"
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
									className="bg-primary px-2 py-1 flex items-center gap-1 font-bold text-primary-foreground text-xs border-[1.5px] border-border"
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
								className="text-foreground text-xs px-2 py-1"
							>
								Log In
							</Button>
							<Button
								onClick={login}
								className="bg-foreground text-primary-foreground text-xs px-2 py-1 hover:bg-foreground/90"
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

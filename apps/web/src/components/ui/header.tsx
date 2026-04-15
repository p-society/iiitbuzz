import { useState } from "react";
import { Link } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/ui/notification-bell";
import ProfileDropdown from "@/components/profile-dropdown";
import {
	Github,
	Home,
	LogOut,
	Menu,
	MessageSquare,
	Plus,
	Settings,
	Shield,
	User,
} from "lucide-react";
import { RxDiscordLogo } from "react-icons/rx";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import logo from "../../../../../assets/logo.png";

interface HeaderProps {
	hideThemeToggle?: boolean;
}

const Header = ({ hideThemeToggle = false }: HeaderProps) => {
	const { user, isLoading, isAuthenticated, isAdmin, login, logout } =
		useAuth();
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

	return (
		<header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
			<div className="site-container py-3 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<img src={logo} alt="IIITBuzz Logo" className="w-7 h-7" />
					<h1 className="font-black text-lg text-foreground tracking-tight">
						IIITBuzz
					</h1>
				</Link>

				<div className="flex items-center gap-2">
					{!hideThemeToggle && (
						<div className="nav-desktop">
							<ModeToggle />
						</div>
					)}

					{isLoading ? (
						<div className="animate-pulse mono-meta">...</div>
					) : isAuthenticated ? (
						<>
							<div className="nav-desktop items-center gap-3">
								{!hideThemeToggle && (
									<Link to="/home">
										<Button
											type="button"
											variant="neutral"
											size="sm"
											className="flex h-9 items-center gap-1 px-3 text-xs font-bold border-2 border-border shadow-none hover:bg-secondary hover:text-black transition-all group"
										>
											<Home className="h-4 w-4 transition-transform group-hover:scale-110" />
											<span>Home</span>
										</Button>
									</Link>
								)}
								{isAdmin && (
									<Link to="/admin">
										<Button
											type="button"
											variant="neutral"
											size="sm"
											className="flex h-9 items-center gap-1 px-3 text-xs font-bold border-2 border-border shadow-none hover:bg-secondary hover:text-black transition-all group"
										>
											<Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
											<span>Admin</span>
										</Button>
									</Link>
								)}
								<NotificationBell />
								<ProfileDropdown />
								{!hideThemeToggle && (
									<Link
										to="/new-thread"
										className="bg-primary h-9 px-4 flex items-center gap-2 font-bold text-primary-foreground text-xs border-2 border-border hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-none group"
									>
										<Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
										<span>New</span>
									</Link>
								)}
							</div>

							<div className="nav-mobile items-center gap-2">
								<NotificationBell />
								{!hideThemeToggle && (
									<Link
										to="/new-thread"
										className="bg-primary p-2 flex items-center justify-center font-bold text-primary-foreground border-2 border-border"
									>
										<Plus className="h-4 w-4" />
									</Link>
								)}

								{!isLoading && (
									<Drawer
										open={isMobileNavOpen}
										onOpenChange={setIsMobileNavOpen}
										direction="right"
									>
										<DrawerTrigger asChild>
											<Button variant="neutral" className="p-2 border-2">
												<Menu className="h-5 w-5" />
											</Button>
										</DrawerTrigger>
										<DrawerContent className="p-4">
											<DrawerHeader className="px-0 pt-0 text-left">
												<DrawerTitle className="text-xl font-black">
													Menu
												</DrawerTitle>
											</DrawerHeader>

											<div className="flex flex-col gap-4 mt-4">
												{user && (
													<div className="p-3 border-2 border-border bg-secondary/50 rounded-lg">
														<p className="font-black text-sm">
															{user.firstName || user.username}
														</p>
														<p className="text-xs text-muted-foreground">
															@{user.username}
														</p>
													</div>
												)}

												<nav className="flex flex-col gap-2">
													<Link
														to="/home"
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
														onClick={() => setIsMobileNavOpen(false)}
													>
														<Home className="h-5 w-5" />
														<span>Home</span>
													</Link>

													{!hideThemeToggle && (
														<div className="flex items-center justify-between p-3 font-bold border-2 border-transparent">
															<div className="flex items-center gap-3">
																<Settings className="h-5 w-5 opacity-50" />
																<span>Theme</span>
															</div>
															<ModeToggle />
														</div>
													)}

													{isAdmin && (
														<Link
															to="/admin"
															className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
															onClick={() => setIsMobileNavOpen(false)}
														>
															<Shield className="h-5 w-5" />
															<span>Admin Dashboard</span>
														</Link>
													)}

													<div className="h-px bg-border my-1" />

													<Link
														to={
															user?.username
																? `/profile/${user.username}`
																: "/my/profile"
														}
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
														onClick={() => setIsMobileNavOpen(false)}
													>
														<User className="h-5 w-5" />
														<span>My Profile</span>
													</Link>

													<Link
														to="/my/profile"
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
														onClick={() => setIsMobileNavOpen(false)}
													>
														<Settings className="h-5 w-5" />
														<span>Settings</span>
													</Link>

													<Link
														to={
															user?.username
																? `/profile/${user.username}`
																: "/my/profile"
														}
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
														onClick={() => setIsMobileNavOpen(false)}
													>
														<MessageSquare className="h-5 w-5" />
														<span>My Threads</span>
													</Link>

													<div className="h-px bg-border my-1" />

													<a
														href="https://github.com/p-society/"
														target="_blank"
														rel="noreferrer"
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
													>
														<Github className="h-5 w-5" />
														<span>GitHub</span>
													</a>
													<a
														href="https://discord.gg/q74qC2exY4"
														target="_blank"
														rel="noreferrer"
														className="flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-border hover:bg-secondary rounded-lg transition-all"
													>
														<RxDiscordLogo className="h-5 w-5" />
														<span>Discord</span>
													</a>

													<div className="mt-4">
														<Button
															variant="neutral"
															className="w-full justify-start gap-3 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
															onClick={() => {
																logout();
																setIsMobileNavOpen(false);
															}}
														>
															<LogOut className="h-5 w-5" />
															<span>Logout</span>
														</Button>
													</div>
												</nav>
											</div>
										</DrawerContent>
									</Drawer>
								)}
							</div>
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

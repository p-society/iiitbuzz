import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

interface UserProfile {
	id: string;
	email?: string; // Only present if own profile
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	pronouns: string | null;
	bio: string | null;
	branch: string | null;
	passingOutYear: number | null;
	totalPosts: number;
}

interface ProfileResponse {
	success: boolean;
	isOwnProfile: boolean;
	user: UserProfile;
}

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user: currentUser, isAuthenticated } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isOwnProfile, setIsOwnProfile] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const backendUrl =
		import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

	useEffect(() => {
		const fetchProfile = async () => {
			if (!username) return;

			try {
				setLoading(true);
				const response = await fetch(`${backendUrl}/user/details/${username}`, {
					credentials: "include",
				});

				if (!response.ok) {
					if (response.status === 404) {
						setError("User not found");
					} else {
						setError("Failed to load profile");
					}
					return;
				}

				const data: ProfileResponse = await response.json();
				setProfile(data.user);
				setIsOwnProfile(data.isOwnProfile);
			} catch (err) {
				setError("Failed to load profile");
				console.error("Profile fetch error:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [username, backendUrl]);

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
						<p className="mt-4 text-muted-foreground">Loading profile...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-foreground mb-4">
							😕 Oops!
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							{error || "Profile not found"}
						</p>
						<Link to="/home">
							<Button>Go Back Home</Button>
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const displayName =
		profile.firstName && profile.lastName
			? `${profile.firstName} ${profile.lastName}`
			: profile.firstName || profile.username || "Anonymous User";

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Profile Header */}
					<div className="neo-brutal-card p-8 mb-8">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-4">
								<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold">
									{displayName.charAt(0).toUpperCase()}
								</div>
								<div>
									<h1 className="text-3xl font-bold pixel-font text-foreground mb-1">
										{displayName}
									</h1>
									{profile.username && (
										<p className="text-muted-foreground text-lg">
											@{profile.username}
										</p>
									)}
									{profile.pronouns && (
										<span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm mt-1">
											{profile.pronouns}
										</span>
									)}
								</div>
							</div>

							{isOwnProfile && (
								<Link to="/my/profile">
									<Button variant="outline" className="neo-brutal-button">
										Edit Profile
									</Button>
								</Link>
							)}
						</div>

						{profile.bio && (
							<div className="mb-6">
								<p className="text-lg public-sans-font text-foreground">
									{profile.bio}
								</p>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{profile.email && isOwnProfile && (
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">📧</span>
									<span className="text-sm text-foreground">
										{profile.email}
									</span>
								</div>
							)}

							{profile.branch && (
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">📍</span>
									<span className="text-sm text-foreground">
										{profile.branch}
									</span>
								</div>
							)}

							{profile.passingOutYear && (
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">📅</span>
									<span className="text-sm text-foreground">
										Class of {profile.passingOutYear}
									</span>
								</div>
							)}

							<div className="flex items-center gap-2">
								<span className="text-muted-foreground">💬</span>
								<span className="text-sm text-foreground">
									{profile.totalPosts} posts
								</span>
							</div>
						</div>
					</div>

					{/* Activity Section */}
					<div className="neo-brutal-card p-8">
						<h2 className="text-2xl font-bold pixel-font text-foreground mb-6">
							Recent Activity
						</h2>
						<div className="text-center py-12 text-muted-foreground">
							<div className="text-6xl mb-4">💬</div>
							<p className="text-lg mb-2">No recent activity to show</p>
							<p className="text-sm">Posts and comments will appear here</p>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

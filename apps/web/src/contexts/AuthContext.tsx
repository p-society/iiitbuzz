import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";

interface User {
    imageUrl: string;
	id: string;
	email: string;
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	pronouns: string | null;
	bio: string | null;
	branch: string | null;
	passingOutYear: number | null;
	totalPosts: number;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: () => void;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const backendUrl =
		import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

	const checkAuth = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await fetch(`${backendUrl}/api/user/me`, {
				credentials: "include", // Include cookies
			});

			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = () => {
		const fullUrl = `${backendUrl}/api/auth/google`;
		window.location.assign(fullUrl);
	};

	const logout = async () => {
		try {
			await fetch(`${backendUrl}/api/auth/logout`, {
				method: "POST",
				credentials: "include",
			});
			setUser(null);
			toast.success("You have been logged out. See you soon! 👋");
		} catch (error) {
			console.error("Logout failed:", error);
			toast.error("Logout failed. Please try again.");
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
		refreshUser: checkAuth,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

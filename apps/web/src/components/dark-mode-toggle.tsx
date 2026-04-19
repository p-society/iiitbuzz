import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

export function DarkModeToggle() {
	const { darkMode, toggleDarkMode } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="border-2 border-border bg-card h-9 w-9 flex items-center justify-center font-bold shadow-none">
				<Sun className="h-4 w-4" />
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={toggleDarkMode}
			className="border-2 border-border bg-card h-9 w-9 flex items-center justify-center font-bold shadow-none transition-all hover:bg-muted/30 hover:scale-105"
			aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
			title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
		>
			{darkMode ? (
				<Moon className="h-4 w-4 transition-transform" />
			) : (
				<Sun className="h-4 w-4 transition-transform" />
			)}
		</button>
	);
}
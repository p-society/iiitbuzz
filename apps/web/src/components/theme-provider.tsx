import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "blue" | "green" | "purple" | "orange" | "teal";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	defaultDarkMode?: boolean;
	storageKey?: string;
	darkModeKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	darkMode: boolean;
	setDarkMode: (darkMode: boolean) => void;
	toggleDarkMode: () => void;
};

const initialState: ThemeProviderState = {
	theme: "blue",
	setTheme: () => null,
	darkMode: false,
	setDarkMode: () => null,
	toggleDarkMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "blue",
	defaultDarkMode = false,
	storageKey = "vite-ui-theme",
	darkModeKey = "vite-ui-dark-mode",
	...props
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
	);
	const [darkMode, setDarkModeState] = useState<boolean>(() => {
		const stored = localStorage.getItem(darkModeKey);
		return stored ? stored === "true" : defaultDarkMode;
	});

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("blue", "green", "purple", "orange", "teal");
		root.classList.add(theme);

		if (darkMode) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme, darkMode]);

	const setTheme = (newTheme: Theme) => {
		localStorage.setItem(storageKey, newTheme);
		setThemeState(newTheme);
	};

	const setDarkMode = (value: boolean) => {
		localStorage.setItem(darkModeKey, String(value));
		setDarkModeState(value);
	};

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	const value = {
		theme,
		setTheme,
		darkMode,
		setDarkMode,
		toggleDarkMode,
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
"use client";

import { Droplet } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { type Theme, useTheme } from "@/components/theme-provider";

// Explicitly type the array to match the Theme type
const themes: {
	name: Theme;
	label: string;
	icon: React.ElementType;
	color: string;
}[] = [
	{ name: "blue", label: "Blue", icon: Droplet, color: "#2563eb" },
	{ name: "green", label: "Green", icon: Droplet, color: "#16a34a" },
	{ name: "purple", label: "Purple", icon: Droplet, color: "#9333ea" },
	{ name: "orange", label: "Orange", icon: Droplet, color: "#ea580c" },
	{ name: "teal", label: "Teal", icon: Droplet, color: "#14b8a6" },
];

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="border-3 border-border bg-card px-4 py-2 font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)]">
				<Droplet className="h-5 w-5" />
			</div>
		);
	}

	const currentTheme = themes.find((t) => t.name === theme) || themes[0];
	const Icon = currentTheme.icon;

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="border-3 flex items-center gap-2 border-border bg-card px-4 py-2 font-bold text-card-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px]"
			>
				<Icon className="h-5 w-5" style={{ color: currentTheme.color }} />
				<span className="hidden sm:inline">{currentTheme.label}</span>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						role="button"
						tabIndex={0}
						onClick={() => setIsOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " " || e.key === "Escape")
								setIsOpen(false);
						}}
					/>
					<div className="absolute right-0 top-full z-20 mt-2 w-48 border-4 border-border bg-card shadow-[8px_8px_0px_0px_var(--shadow-color)]">
						<div className="p-2 space-y-1">
							{themes.map((themeOption) => {
								const ThemeIcon = themeOption.icon;
								return (
									<button
										type="button"
										key={themeOption.name}
										onClick={() => {
											setTheme(themeOption.name);
											setIsOpen(false);
										}}
										className={`flex w-full items-center gap-3 border-2 border-border px-4 py-2 font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] ${
											theme === themeOption.name
												? "bg-primary text-primary-foreground"
												: "bg-card text-card-foreground hover:bg-muted"
										}`}
									>
										<ThemeIcon
											className="h-4 w-4"
											style={{ color: themeOption.color }}
										/>
										{themeOption.label}
									</button>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import * as React from "react";

import { cn } from "@/lib/utils";

const extractText = (node: React.ReactNode): string => {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map((child) => extractText(child)).join(" ");
	}

	if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
		return extractText(node.props.children);
	}

	return "";
};

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 border-[1.5px] border-border",
	{
		variants: {
			variant: {
				default: "text-main-foreground bg-main hover:bg-main/90",
				noShadow: "text-main-foreground bg-main",
				neutral: "bg-secondary-background text-foreground hover:bg-muted/50",
				reverse: "text-main-foreground bg-main hover:bg-main/90",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 px-3",
				lg: "h-11 px-8",
				icon: "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	tooltip,
	title,
	children,
	"aria-label": ariaLabel,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		tooltip?: string;
	}) {
	const Comp = asChild ? Slot : "button";
	const autoTitle = extractText(children).trim();
	const resolvedTitle = tooltip || title || ariaLabel || autoTitle || undefined;

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			title={resolvedTitle}
			aria-label={ariaLabel}
			{...props}
		>
			{children}
		</Comp>
	);
}

export { Button, buttonVariants };

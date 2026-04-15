import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
	...defaultSchema,
	tagNames: [...(defaultSchema.tagNames ?? []), "img"],
	attributes: {
		...defaultSchema.attributes,
		img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "title"],
	},
};

interface MarkdownContentProps {
	content: string;
}

const mentionRegex = /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{3,32})/g;

function renderMentionText(text: string) {
	const nodes: Array<string | ReactElement> = [];
	let lastIndex = 0;

	for (const match of text.matchAll(mentionRegex)) {
		const matchIndex = match.index ?? 0;
		const prefix = match[1] ?? "";
		const username = match[2];
		const prefixLength = prefix.length;
		const mentionStart = matchIndex + prefixLength;
		const mentionEnd = mentionStart + username.length + 1;

		if (matchIndex > lastIndex) {
			nodes.push(text.slice(lastIndex, matchIndex));
		}

		if (prefix) {
			nodes.push(prefix);
		}

		nodes.push(
			<Link
				key={`${username}-${mentionStart}`}
				to={`/profile/${username}`}
				className="font-bold text-primary underline hover:text-primary/80"
			>
				@{username}
			</Link>,
		);

		lastIndex = mentionEnd;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes.length ? nodes : text;
}

function renderMentions(children: ReactNode): ReactNode {
	return Children.map(children, (child) => {
		if (typeof child === "string") {
			return renderMentionText(child);
		}

		if (!isValidElement(child)) {
			return child;
		}

		if (typeof child.type === "string" && ["a", "code", "pre"].includes(child.type)) {
			return child;
		}

		const element = child as ReactElement<{ children?: ReactNode }>;
		return cloneElement(element, {
			children: renderMentions(element.props.children),
		});
	});
}

export function MarkdownContent({ content }: MarkdownContentProps) {
	return (
		<div className="markdown-content text-xs sm:text-sm leading-relaxed">
			<ReactMarkdown
				rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
				components={{
					p: ({ children }) => (
						<p className="mb-2 last:mb-0">{renderMentions(children)}</p>
					),
					strong: ({ children }) => (
						<strong className="font-black">{renderMentions(children)}</strong>
					),
					em: ({ children }) => <em className="italic">{renderMentions(children)}</em>,
					a: ({ href, children }) => (
						<a
							href={href}
							className="text-primary underline hover:text-primary/80"
							target="_blank"
							rel="noopener noreferrer"
						>
							{children}
						</a>
					),
					img: ({ src, alt }) => (
						<img
							src={src}
							alt={alt || ""}
							className="max-w-full rounded border-2 border-black my-2 shadow-[2px_2px_0_0_#000]"
							loading="lazy"
						/>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-primary pl-3 py-1 my-2 bg-muted/50 italic">
							{renderMentions(children)}
						</blockquote>
					),
					code: ({ className, children }) => {
						const isInline = !className;
						if (isInline) {
							return (
								<code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">
									{children}
								</code>
							);
						}
						return (
							<pre className="bg-muted p-2 rounded overflow-x-auto my-2 text-[10px]">
								<code className={className}>{children}</code>
							</pre>
						);
					},
					ul: ({ children }) => (
						<ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
					),
					ol: ({ children }) => (
						<ol className="list-decimal list-inside mb-2 space-y-1">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="ml-2">{renderMentions(children)}</li>,
					h1: ({ children }) => (
						<h1 className="font-black text-lg mb-2">{renderMentions(children)}</h1>
					),
					h2: ({ children }) => (
						<h2 className="font-black text-base mb-2">{renderMentions(children)}</h2>
					),
					h3: ({ children }) => (
						<h3 className="font-bold text-sm mb-1">{renderMentions(children)}</h3>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

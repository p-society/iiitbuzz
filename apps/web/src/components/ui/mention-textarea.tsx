import * as React from "react";
import { api } from "@/lib/api";
import type { UserMentionSuggestion } from "@/types/user";
import { Textarea } from "@/components/ui/textarea";

const mentionQueryRegex = /(^|[\s([{"'])@([a-zA-Z0-9_]*)$/;

function getMentionMatch(value: string, caretIndex: number) {
	const textBeforeCaret = value.slice(0, caretIndex);
	const match = textBeforeCaret.match(mentionQueryRegex);
	if (!match) {
		return null;
	}

	const query = match[2] ?? "";
	return {
		query,
		start: caretIndex - query.length - 1,
		end: caretIndex,
	};
}

type MentionTextareaProps = Omit<
	React.ComponentProps<typeof Textarea>,
	"onChange" | "value"
> & {
	value: string;
	onValueChange: (value: string) => void;
	suggestionLimit?: number;
};

export const MentionTextarea = React.forwardRef<
	HTMLTextAreaElement,
	MentionTextareaProps
>(
	(
		{
			value,
			onValueChange,
			suggestionLimit = 6,
			onKeyDown,
			onClick,
			onKeyUp,
			className,
			...props
		},
		forwardedRef,
	) => {
		const [mentionQuery, setMentionQuery] = React.useState("");
		const [mentionRange, setMentionRange] = React.useState<{
			start: number;
			end: number;
		} | null>(null);
		const [mentionSuggestions, setMentionSuggestions] = React.useState<
			UserMentionSuggestion[]
		>([]);
		const [showMentionSuggestions, setShowMentionSuggestions] =
			React.useState(false);
		const [activeMentionIndex, setActiveMentionIndex] = React.useState(0);
		const [loadingMentions, setLoadingMentions] = React.useState(false);
		const localTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

		const setTextareaNode = React.useCallback(
			(node: HTMLTextAreaElement | null) => {
				localTextareaRef.current = node;
				if (!forwardedRef) return;
				if (typeof forwardedRef === "function") {
					forwardedRef(node);
					return;
				}
				forwardedRef.current = node;
			},
			[forwardedRef],
		);

		const updateMentionState = React.useCallback(
			(nextValue: string, caretIndex: number) => {
				const match = getMentionMatch(nextValue, caretIndex);
				if (!match) {
					setMentionRange(null);
					setMentionQuery("");
					setMentionSuggestions([]);
					setShowMentionSuggestions(false);
					setActiveMentionIndex(0);
					return;
				}

				const shouldResetActiveIndex =
					match.query !== mentionQuery ||
					match.start !== mentionRange?.start ||
					match.end !== mentionRange?.end;

				setMentionRange({ start: match.start, end: match.end });
				setMentionQuery(match.query);
				setShowMentionSuggestions(true);
				if (shouldResetActiveIndex) {
					setActiveMentionIndex(0);
				}
			},
			[mentionQuery, mentionRange?.end, mentionRange?.start],
		);

		React.useEffect(() => {
			if (!showMentionSuggestions || !mentionRange || props.disabled) {
				return;
			}

			let cancelled = false;
			const timeoutId = window.setTimeout(async () => {
				setLoadingMentions(true);
				try {
					const res = await api.searchUsers(mentionQuery, suggestionLimit);
					if (cancelled) return;
					setMentionSuggestions(res.users);
					setShowMentionSuggestions(res.users.length > 0);
					setActiveMentionIndex((prev) => {
						if (!res.users.length) return 0;
						return Math.min(prev, res.users.length - 1);
					});
				} catch {
					if (cancelled) return;
					setMentionSuggestions([]);
					setShowMentionSuggestions(false);
				} finally {
					if (!cancelled) {
						setLoadingMentions(false);
					}
				}
			}, 150);

			return () => {
				cancelled = true;
				window.clearTimeout(timeoutId);
			};
		}, [
			mentionQuery,
			mentionRange?.start,
			mentionRange?.end,
			props.disabled,
			showMentionSuggestions,
			suggestionLimit,
		]);

		const insertMention = React.useCallback(
			(username: string) => {
				const textarea = localTextareaRef.current;
				if (!textarea || !mentionRange) {
					return;
				}

				const mentionText = `@${username} `;
				const nextValue =
					value.slice(0, mentionRange.start) +
					mentionText +
					value.slice(mentionRange.end);
				onValueChange(nextValue);
				setMentionSuggestions([]);
				setShowMentionSuggestions(false);
				setMentionRange(null);
				setMentionQuery("");

				window.requestAnimationFrame(() => {
					const nextCaret = mentionRange.start + mentionText.length;
					textarea.focus();
					textarea.setSelectionRange(nextCaret, nextCaret);
				});
			},
			[mentionRange, onValueChange, value],
		);

		const handleValueChange = (nextValue: string) => {
			onValueChange(nextValue);
			const textarea = localTextareaRef.current;
			const caretIndex = textarea?.selectionStart ?? nextValue.length;
			updateMentionState(nextValue, caretIndex);
		};

		const handleCaretEvent = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
			updateMentionState(
				event.currentTarget.value,
				event.currentTarget.selectionStart ?? event.currentTarget.value.length,
			);
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			onKeyDown?.(event);
			if (event.defaultPrevented) return;
			if (!showMentionSuggestions || !mentionSuggestions.length) {
				return;
			}

			if (event.key === "ArrowDown") {
				event.preventDefault();
				setActiveMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				setActiveMentionIndex(
					(prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length,
				);
				return;
			}

			if (event.key === "Enter" || event.key === "Tab") {
				event.preventDefault();
				insertMention(mentionSuggestions[activeMentionIndex].username);
				return;
			}

			if (event.key === "Escape") {
				event.preventDefault();
				setShowMentionSuggestions(false);
			}
		};

		return (
			<div className="relative">
				<Textarea
					{...props}
					ref={setTextareaNode}
					value={value}
					onChange={(event) => handleValueChange(event.target.value)}
					onKeyDown={handleKeyDown}
					onClick={(event) => {
						onClick?.(event);
						if (!event.defaultPrevented) {
							handleCaretEvent(event);
						}
					}}
					onKeyUp={(event) => {
						onKeyUp?.(event);
						if (!event.defaultPrevented) {
							handleCaretEvent(event);
						}
					}}
					className={className}
				/>
				{showMentionSuggestions && !props.disabled && (
					<div className="absolute left-0 right-0 top-[calc(100%-0.25rem)] z-20 border border-black bg-card shadow-[2px_2px_0_0_#000]">
						{loadingMentions ? (
							<p className="px-3 py-2 text-[10px] font-bold text-muted-foreground">
								Searching usernames...
							</p>
						) : mentionSuggestions.length ? (
							mentionSuggestions.map((user, index) => (
								<button
									key={user.id}
									type="button"
									onMouseDown={(event) => {
										event.preventDefault();
										insertMention(user.username);
									}}
									className={`flex w-full items-center justify-between border-b border-black/10 px-3 py-2 text-left text-xs last:border-b-0 ${
										index === activeMentionIndex ? "bg-secondary" : "bg-card"
									}`}
								>
									<span className="font-bold">@{user.username}</span>
									<span className="text-[10px] text-muted-foreground">
										tag user
									</span>
								</button>
							))
						) : (
							<p className="px-3 py-2 text-[10px] font-bold text-muted-foreground">
								No matching usernames
							</p>
						)}
					</div>
				)}
			</div>
		);
	},
);

MentionTextarea.displayName = "MentionTextarea";

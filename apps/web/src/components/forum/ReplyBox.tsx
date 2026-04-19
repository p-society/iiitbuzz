import React, { type ForwardedRef, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/ui/mention-textarea";
import { ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/ui/markdown";

interface ReplyBoxProps {
	content: string;
	setContent: (val: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	submitting: boolean;
	onFormat: (syntax: string) => void;
	textareaRef: ForwardedRef<HTMLTextAreaElement>;
	error?: string | null;
	replyTo?: { author: string; content: string } | null;
	onClearReplyTo?: () => void;
	threadId: string;
	useDraft?: boolean;
	onReload?: () => Promise<void>;
	isThreadAnonymous?: boolean;
	isAnonymous?: boolean;
	onAnonymousChange?: (val: boolean) => void;
}

export const ReplyBox = ({
	content,
	setContent,
	onSubmit,
	submitting,
	onFormat,
	textareaRef,
	error,
	replyTo,
	onClearReplyTo,
	threadId,
	useDraft = true,
	onReload,
	isThreadAnonymous,
	isAnonymous,
	onAnonymousChange,
}: ReplyBoxProps) => {
	const [showHelp, setShowHelp] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [draftId, setDraftId] = useState<string | null>(null);
	const [creatingDraft, setCreatingDraft] = useState(false);

	const ensureDraft = useCallback(async () => {
		if (draftId || !useDraft) return draftId;
		setCreatingDraft(true);
		try {
			const res = await api.createDraftPost(threadId);
			setDraftId(res.post.id);
			return res.post.id;
		} catch {
			return null;
		} finally {
			setCreatingDraft(false);
		}
	}, [draftId, threadId, useDraft]);

	const handleInsertQuote = () => {
		if (!replyTo) return;
		const quotedContent = replyTo.content
			.split("\n")
			.map((line) => `> ${line}`)
			.join("\n");
		const newContent = content
			? `${content}\n\n${quotedContent}\n\n`
			: `${quotedContent}\n\n`;
		setContent(newContent);
		onClearReplyTo?.();
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (fileInputRef.current) fileInputRef.current.value = "";
		handleFileDrop(file);
	};

	const handleFileDrop = async (file: File) => {
		const ALLOWED_TYPES = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
		];
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5MB");
			return;
		}

		const imageId = crypto.randomUUID();
		const blobUrl = URL.createObjectURL(file);
		const placeholder = `![${file.name}](${blobUrl})`;
		const beforeInsert = content;
		const newContent = beforeInsert
			? `${beforeInsert}\n${placeholder}`
			: placeholder;
		setContent(newContent);

		setUploading(true);
		try {
			const postId = useDraft ? await ensureDraft() : null;
			if (useDraft && !postId) {
				toast.error("Failed to create draft post for image upload");
				setContent(beforeInsert);
				return;
			}
			const res = await api.presignUpload(postId || "temp", imageId, file.type);
			await api.uploadToR2(res.uploadUrl, file);
			const finalContent = newContent.replace(blobUrl, res.fileUrl);
			setContent(finalContent);
			toast.success("Image uploaded!");
		} catch {
			toast.error("Failed to upload image");
			setContent(beforeInsert);
		} finally {
			setUploading(false);
		}
	};

	const handlePaste = async (e: React.ClipboardEvent) => {
		const items = e.clipboardData.items;
		for (let i = 0; i < items.length; i++) {
			if (items[i].type.startsWith("image/")) {
				e.preventDefault();
				const file = items[i].getAsFile();
				if (file) await handleFileDrop(file);
				return;
			}
		}
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			await handleFileDrop(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		if (useDraft && draftId) {
			try {
				await api.publishDraft(draftId, content, isAnonymous);
				if (isAnonymous) {
					toast.success("Reply submitted! It will appear after admin approval.");
				} else {
					toast.success("Reply posted!");
				}
				setDraftId(null);
				setContent("");
				if (onReload) await onReload();
			} catch {
				toast.error("Failed to post reply");
				return;
			}
		} else {
			onSubmit(e);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-4 border border-border bg-card p-3"
		>
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-bold text-sm text-foreground">Post a Reply</h3>
				<span className="mono-label">{"// SECTION: REPLY"}</span>
			</div>

			{replyTo && (
				<div className="mb-2 p-2 bg-gray-50 border border-black">
					<div className="flex justify-between items-start mb-1">
						<span className="mono-meta">Replying to {replyTo.author}</span>
						<button
							type="button"
							onClick={onClearReplyTo}
							className="mono-meta hover:underline"
						>
							Cancel
						</button>
					</div>
					<div className="text-[10px] text-muted-foreground line-clamp-2">
						{replyTo.content.substring(0, 100)}
						{replyTo.content.length > 100 ? "..." : ""}
					</div>
					<Button
						type="button"
						size="sm"
						onClick={handleInsertQuote}
						className="mt-2 py-0.5 px-2 text-[10px] font-bold"
					>
						Insert Quote
					</Button>
				</div>
			)}

			<div className="relative">
				<MentionTextarea
					placeholder="Share your thoughts... Use @username, **bold**, *italic*, >quote or paste/drop images"
					value={content}
					onValueChange={setContent}
					onPaste={handlePaste}
					onDrop={handleDrop}
					onDragOver={(e) => e.preventDefault()}
					ref={textareaRef}
					disabled={submitting || creatingDraft}
					className="mb-2 h-24 resize-none text-xs font-medium border"
				/>
				<input
					type="file"
					ref={fileInputRef}
					accept="image/jpeg,image/png,image/gif,image/webp"
					onChange={handleImageUpload}
					className="hidden"
				/>
			</div>

			{showPreview && content.trim() && (
				<div className="mb-2 p-2 border border-black bg-gray-50 max-h-60 overflow-y-auto">
					<div className="mono-label mb-1">PREVIEW</div>
					<MarkdownContent content={content} />
				</div>
			)}

			{error && (
				<p className="mb-2 font-bold text-destructive text-xs bg-destructive/10 p-2 border border-destructive">
					{error}
				</p>
			)}

			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap gap-1">
					{[
						{ label: "Bold", syntax: "**" },
						{ label: "Italic", syntax: "*" },
						{ label: "Quote", syntax: ">" },
						{ label: "Code", syntax: "`" },
						{ label: "Link", syntax: "[]" },
					].map(({ label, syntax }) => (
						<Button
							key={label}
							type="button"
							size="sm"
							variant="neutral"
							onClick={() => onFormat(syntax)}
							className="bg-card px-2 py-0.5 font-bold text-[10px]"
						>
							{label}
						</Button>
					))}
					<Button
						type="button"
						size="sm"
						variant="neutral"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading || creatingDraft}
						className="bg-card px-2 py-0.5 font-bold text-[10px]"
					>
						<ImageIcon className="h-3 w-3" />
						{uploading ? "..." : ""}
					</Button>
					<Button
						type="button"
						size="sm"
						variant="neutral"
						onClick={() => setShowHelp(!showHelp)}
						className="bg-card px-2 py-0.5 font-bold text-[10px]"
					>
						?
					</Button>
					<Button
						type="button"
						size="sm"
						variant="neutral"
						onClick={() => setShowPreview(!showPreview)}
						className={`px-2 py-0.5 font-bold text-[10px] ${showPreview ? "bg-primary text-primary-foreground" : "bg-card"}`}
					>
						Preview
					</Button>
					{isThreadAnonymous && (
						<label className="flex items-center gap-1 px-2 py-0.5 font-bold text-[10px] cursor-pointer">
							<input
								type="checkbox"
								checked={isAnonymous}
								onChange={(e) => onAnonymousChange?.(e.target.checked)}
								className="accent-primary"
							/>
							Anonymous
						</label>
					)}
				</div>
				<button
					type="submit"
					disabled={submitting || !content.trim() || creatingDraft || uploading}
					className="bg-primary text-primary-foreground px-3 py-1 font-bold text-xs border-[1.5px] border-border disabled:opacity-50"
				>
					{submitting ? "..." : "Post"}
				</button>
			</div>

			{showHelp && (
				<div className="mt-2 p-2 bg-gray-50 border border-gray-200 text-[10px]">
					<p className="font-bold mb-1 mono-label">Markdown Help:</p>
					<ul className="space-y-0.5 mono-meta">
						<li>
							<code>**bold**</code> → bold
						</li>
						<li>
							<code>*italic*</code> → italic
						</li>
						<li>
							<code>&gt;quote</code> → blockquote
						</li>
						<li>
							<code>`code`</code> → inline code
						</li>
						<li>
							<code>[text](url)</code> → link
						</li>
					</ul>
				</div>
			)}
		</form>
	);
};

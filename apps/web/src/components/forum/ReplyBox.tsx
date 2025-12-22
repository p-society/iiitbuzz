import React, { type ForwardedRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReplyBoxProps {
    content: string;
    setContent: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    submitting: boolean;
    onFormat: (syntax: string) => void;
    textareaRef: ForwardedRef<HTMLTextAreaElement>;
    error?: string | null; 
}

export const ReplyBox = ({ 
    content, setContent, onSubmit, submitting, onFormat, textareaRef, error 
}: ReplyBoxProps) => (
    <form onSubmit={onSubmit} className="mt-6 sm:mt-8 neo-brutal-card p-4 sm:p-6">
        <h3 className="mb-3 sm:mb-4 font-bold text-lg sm:text-xl text-foreground">Post a Reply</h3>
        
        <Textarea
            placeholder="Share your thoughts... (Use **text** for bold, *text* for italic)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            ref={textareaRef}
            disabled={submitting}
            className="mb-3 sm:mb-4 h-32 resize-none text-sm font-medium border-2"
        />

        {/* Error Message Display */}
        {error && (
            <p className="mb-4 font-bold text-destructive text-sm bg-destructive/10 p-2 border-2 border-destructive rounded">
                {error}
            </p>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
                {['**', '*', 'Link'].map((label) => (
                    <Button
                        key={label}
                        type="button"
                        size="sm"
                        variant="neutral"
                        onClick={() => onFormat(label)}
                        disabled={label === 'Link'}
                        className="neo-brutal-button bg-card px-3 py-2 font-bold text-xs"
                    >
                        {label === '**' ? 'Bold' : label === '*' ? 'Italic' : 'Link'}
                    </Button>
                ))}
            </div>
            <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="neo-brutal-button-strong bg-primary px-4 py-2 font-bold text-sm text-primary-foreground disabled:opacity-50"
            >
                {submitting ? "Posting..." : "Post Reply"}
            </button>
        </div>
    </form>
);
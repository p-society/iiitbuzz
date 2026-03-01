import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PostItem } from "@/components/forum/PostItem";
import { ReplyBox } from "@/components/forum/ReplyBox";
import { api } from "@/lib/api";
import { getTopicColor } from "@/lib/utils/topicColor";
import type { ThreadDetail, PostDetail } from "@/types/forum";

export default function ThreadPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [posts, setPosts] = useState<PostDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);
    const replyContentRef = useRef<HTMLTextAreaElement>(null);

    const loadThreadData = async () => {
        if (!threadId) return;
        try {
            const [tRes, pRes] = await Promise.all([
                api.getThreadById(threadId),
                api.getPostsByThreadId(threadId)
            ]);
            
            setThread({
                ...tRes.thread,
                title: tRes.thread.threadTitle,
                authorId: tRes.thread.createdBy,
                topicColor: getTopicColor(tRes.thread.topicId)
            });
            setPosts(pRes.posts.map((p: any) => ({
                ...p,
                authorAvatar: p.authorName.substring(0, 2).toUpperCase()
            })));
        } catch (err) {
            toast.error("Thread not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadThreadData(); }, [threadId]);

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !threadId) return;

        setSubmittingReply(true);
        setPostError(null); 

        try {
            await api.createPost({ threadId, content: replyContent });
            setReplyContent("");
            await loadThreadData(); 
            toast.success("Reply posted!");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to post reply";
            setPostError(message);
            toast.error("Wait, something went wrong.");
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleContentChange = (val: string) => {
        setReplyContent(val);
        if (postError) setPostError(null);
    };

    const handleFormatting = (syntax: string) => {
        const el = replyContentRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = el.value;
        const newText = text.substring(0, start) + syntax + text.substring(start, end) + syntax + text.substring(end);
        setReplyContent(newText);
    };

    if (loading || !thread) return <div className="p-20 text-center font-bold">Loading Thread...</div>;

    return (
        
        <div className="min-h-screen bg-background pb-12">
            <header className="neo-brutal-header p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <Link 
                            to="/home" 
                            className="inline-flex items-center gap-2 font-bold text-sm hover:underline"
                        >
                            <ArrowLeft size={16} /> Back to Forum
                        </Link>
                        
                        
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`px-2 py-0.5 rounded border-2 border-black font-bold text-xs ${thread.topicColor}`}>{thread.topicName}</span>
                            <h1 className="text-3xl font-bold mt-2">{thread.title}</h1>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="neutral" size="icon" className="neo-brutal-button"><Bookmark /></Button>
                             <Button variant="neutral" size="icon" className="neo-brutal-button"><Share2 /></Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 space-y-6">
                {posts.map((post, i) => (
                    <PostItem key={post.postId} post={post} index={i} isOP={post.authorId === thread.authorId} />
                ))}
                
                <ReplyBox 
                    content={replyContent} 
                    setContent={handleContentChange} 
                    onSubmit={handlePostReply} 
                    submitting={submittingReply}
                    onFormat={handleFormatting}
                    textareaRef={replyContentRef}
                    error={postError} 
                />
            </main>
        </div>
       
    );
}
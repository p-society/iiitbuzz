import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ImageIcon, Link2, Code, Info } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { CategoryTile } from "@/components/forum/CategoryTile";
import type { TopicOption } from "@/types/forum";
import { Button } from "@/components/ui/button";



export default function NewThreadPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [title, setTitle] = useState("");
    const [content, setContent] = useState(""); 
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.getTopics();
        const mapped = res.data.map(t => ({
          ...t,
          
        }));
        setTopics(mapped);

        const state = location.state as { initialTopicId?: string };
        if (state?.initialTopicId) setSelectedTopicId(state.initialTopicId);
      } catch (err) {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTopicId) return setError("Please select a category.");
    if (title.trim().length < 5) return setError("Title must be at least 5 characters.");

    setSubmitting(true);
    try {
      const res = await api.createThread({ 
        topicId: selectedTopicId, 
        threadTitle: title 
      });
      
      toast.success("Thread created successfully!");
      navigate(`/topic/${selectedTopicId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the thread.");
      toast.error("Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <header className="border-b-4 border-black bg-card p-6">
        <div className="mx-auto max-w-4xl">
          <Link to="/home" className="mb-4 inline-flex items-center gap-2 font-bold text-primary text-sm hover:underline">
            <ArrowLeft size={16} /> Back to Forum
          </Link>
          <h1 className="font-bold text-3xl sm:text-4xl">Start a Conversation</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <section>
            <label className="mb-4 block font-bold text-xl">1. Choose a Category</label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map(topic => (
                <CategoryTile 
                  key={topic.id} 
                  topic={topic} 
                  isSelected={selectedTopicId === topic.id}
                  onClick={() => { setSelectedTopicId(topic.id); setError(null); }}
                  disabled={submitting}
                />
              ))}
            </div>
          </section>

          <section>
            <label className="mb-2 block font-bold text-xl">2. Thread Title</label>
            <input
              className="neo-brutal-input w-full p-4 font-bold text-lg"
              placeholder="Give your discussion a clear name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </section>

          <section className="opacity-60">
            <div className="flex items-center gap-2 mb-2">
               <label className="block font-bold text-xl">3. Content</label>
               <span className="text-[10px] font-bold bg-secondary border-2 border-black px-1 rounded">COMING SOON</span>
            </div>
            <div className="neo-brutal-card overflow-hidden grayscale">
                <div className="flex gap-2 border-b-4 border-black bg-secondary p-3">
                   <Button type="button" variant="neutral" size="sm" className="neo-brutal-button"><Link2 size={16}/></Button>
                   <Button type="button" variant="neutral" size="sm" className="neo-brutal-button"><ImageIcon size={16}/></Button>
                   <Button type="button" variant="neutral" size="sm" className="neo-brutal-button"><Code size={16}/></Button>
                </div>
                <textarea 
                  className="w-full h-32 p-4 bg-card focus:outline-none font-medium cursor-not-allowed"
                  placeholder="Detailed content will be enabled in a future update..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled
                />
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 font-bold text-destructive bg-destructive/10 border-4 border-destructive p-4">
                <Info size={20} />
                {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              disabled={submitting || !selectedTopicId || title.length < 5}
              className="neo-brutal-button-strong bg-yellow-400 px-10 py-4 font-bold text-lg disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Launch Thread'}
            </button>
            <Link to="/home" className="neo-brutal-button bg-white px-10 py-4 font-bold text-lg text-center">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
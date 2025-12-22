import type{ Topic, ForumStats, Pagination , TopicDetail , Thread } from "@/types/forum";
import type{UserProfile,ProfileFormData} from "@/types/user";
const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
        ...options,
        credentials: "include", 
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
}

export const api = {
    
    getTopics: () => apiFetch<{ success: boolean; data: Topic[] }>("/topics"),
    
    
    getThreads: (params: { page: number; limit: number; sort: string; search?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiFetch<{ success: boolean; threads: any[]; pagination: Pagination }>(`/threads?${query}`);
    },
    
    getThreadById: (id: string) => 
        apiFetch<{ success: boolean; thread: any }>(`/threads/${id}`),
    

    getUserProfile: (username: string) => 
        apiFetch<{ 
            success: boolean; 
            user: UserProfile; 
            isOwnProfile: boolean 
        }>(`/user/details/${username}`),
    updateProfile: async (formData: ProfileFormData) => {
        const updateData = {
            ...formData,
            passingOutYear: formData.passingOutYear
                ? parseInt(formData.passingOutYear)
                : null,
        };
    
        const cleanedData: Record<string, any> = {};
        Object.entries(updateData).forEach(([key, value]) => {
            cleanedData[key] = value === "" ? null : value;
        });
    
        return apiFetch<{ success: boolean; username: string }>('/user/me', {
            method: "PATCH",
            body: JSON.stringify(cleanedData),
        });
    },
    // src/lib/api.ts

    createThread: (payload: { topicId: string; threadTitle: string }) => 
        apiFetch<{ success: boolean; thread: { id: string } }>("/threads/new", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    getTopicById: (topicId: string) => 
    apiFetch<{ success: boolean; topic: TopicDetail }>(`/topics/${topicId}`),

    getThreadsByTopic: (topicId: string, page: number, limit: number, sort: string) =>
        apiFetch<{ 
            success: boolean; 
            threads: Thread[]; 
            pagination: { count: number } 
        }>(`/topics/${topicId}/threads?page=${page}&limit=${limit}&sort=${sort}`),
    // Posts
    getPostsByThreadId: (threadId: string) =>
        apiFetch<{ success: boolean; posts: any[] }>(`/threads/${threadId}/posts?limit=100`),

    createPost: (payload: { threadId: string; content: string }) =>
        apiFetch<{ success: boolean }>("/posts", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    // Stats
    getStats: () => apiFetch<{ success: boolean; stats: ForumStats }>("/stats"),
};
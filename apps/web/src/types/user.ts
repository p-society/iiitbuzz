export interface UserProfile {
    imageUrl: string | undefined;
    id: string;
    username: string;
    email?: string;
    firstName: string | null;
    lastName: string | null;
    pronouns: string | null;
    bio: string | null;
    branch: string | null;
    passingOutYear: number | null;
    totalPosts: number;
}

export interface ProfileDisplayData {
    username: string;
    avatar: string;
    role: string;
    bio: string;
    location: string;
    joinDate: string;
}


export interface ProfileFormData {
    username: string;
    firstName: string;
    lastName: string;
    pronouns: string;
    bio: string;
    branch: string;
    passingOutYear: string;
}
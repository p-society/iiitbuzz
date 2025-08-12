import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

interface ProfileFormData {
    username: string;
    firstName: string;
    lastName: string;
    pronouns: string;
    bio: string;
    branch: string;
    passingOutYear: string;
}

export default function MyProfilePage() {
    const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ProfileFormData>({
        username: '',
        firstName: '',
        lastName: '',
        pronouns: '',
        bio: '',
        branch: '',
        passingOutYear: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Populate form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                pronouns: user.pronouns || '',
                bio: user.bio || '',
                branch: user.branch || '',
                passingOutYear: user.passingOutYear?.toString() || '',
            });
        }
    }, [user]);

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Prepare data for API (convert passingOutYear to number)
            const updateData = {
                ...formData,
                passingOutYear: formData.passingOutYear ? parseInt(formData.passingOutYear) : null,
            };

            // Remove empty strings (convert to null)
            const cleanedData: any = {};
            Object.entries(updateData).forEach(([key, value]) => {
                cleanedData[key] = value === '' ? null : value;
            });

            const response = await fetch(`${backendUrl}/user/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const result = await response.json();
            
            // Refresh user data in context
            await refreshUser();
            
            // Show success toast notification
            toast.success("Profile updated successfully!", {
                description: "Your changes have been saved.",
                duration: 3000,
            });
            
            // Redirect to profile page
            if (result.user.username) {
                navigate(`/profile/${result.user.username}`);
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="neo-brutal-card p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold pixel-font text-foreground">Edit My Profile</h1>
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="neo-brutal-button"
                            >
                                Cancel
                            </Button>
                        </div>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder="Enter a unique username"
                                    className="neo-brutal-input text-white"
                                />
                                <p className="text-sm text-muted-foreground">
                                    This will be your public profile URL: /profile/{formData.username || 'username'}
                                </p>
                            </div>

                            {/* Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                                        First Name
                                    </label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        placeholder="Enter your first name"
                                        className="neo-brutal-input text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                                        Last Name
                                    </label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        placeholder="Enter your last name"
                                        className="neo-brutal-input text-white"
                                    />
                                </div>
                            </div>

                            {/* Pronouns */}
                            <div className="space-y-2">
                                <label htmlFor="pronouns" className="block text-sm font-medium text-foreground">
                                    Pronouns
                                </label>
                                <select
                                    id="pronouns"
                                    value={formData.pronouns}
                                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                                    className="neo-brutal-input w-full text-white"
                                >
                                    <option value="">Select your pronouns</option>
                                    <option value="he/him">he/him</option>
                                    <option value="she/her">she/her</option>
                                    <option value="they/them">they/them</option>
                                    <option value="he/they">he/they</option>
                                    <option value="she/they">she/they</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    placeholder="Tell others about yourself..."
                                    className="border-red-500 neo-brutal-input min-h-[100px] w-full resize-vertical text-white "
                                    maxLength={255}
                                />
                                <p className="text-sm text-muted-foreground">
                                    {formData.bio.length}/255 characters
                                </p>
                            </div>

                            {/* Academic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="branch" className="block text-sm font-medium text-foreground">
                                        Branch
                                    </label>
                                    <select
                                        id="branch"
                                        value={formData.branch}
                                        onChange={(e) => handleInputChange('branch', e.target.value)}
                                        className="neo-brutal-input w-full text-white"
                                    >
                                        <option value="">Select your branch</option>
                                        <option value="CSE">Computer Science & Engineering</option>
                                        <option value="ECE">Electronics & Communication</option>
                                        <option value="EEE">Electrical & Electronics</option>
                                        <option value="ME">Mechanical Engineering</option>
                                        <option value="CE">Civil Engineering</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="AIDS">AI & Data Science</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="passingOutYear" className="block text-sm font-medium text-foreground">
                                        Passing Out Year
                                    </label>
                                    <select
                                        id="passingOutYear"
                                        value={formData.passingOutYear}
                                        onChange={(e) => handleInputChange('passingOutYear', e.target.value)}
                                        className="neo-brutal-input w-full text-white"
                                    >
                                        <option value="">Select year</option>
                                        {Array.from({ length: 8 }, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return (
                                                <option key={year} value={year.toString()}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="neo-brutal-button bg-foreground text-background flex-1"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Profile'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

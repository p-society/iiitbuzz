import { Link } from "react-router";
import { 
  User, 
  Settings, 
  MessageSquare, 
  Github, 
  LogOut, 
  ChevronDown
} from "lucide-react";
import { RxDiscordLogo } from "react-icons/rx";
// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
 

  // If there's no user, don't render the dropdown
  if (!user) return null;

  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="neutral" 
          className="border-3 flex items-center gap-2 neo-brutal-button border-primary text-primary bg-secondary hover:bg-secondary hover:text-black"
        >
          
          <span className="text-sm  tracking-tight">
            {user.firstName || user.username}
          </span>
          <ChevronDown size={16} className="text-primary opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end"
        className="w-52 mt-1.5 border-4 border-primary bg-card p-2 shadow-[6px_6px_0px_0px_var(--shadow-color)]"
      >
        <div className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ">
          Account Menu
        </div>

        <DropdownMenuItem asChild>
          <Link 
            to={user.username ? `/profile/${user.username}` : "/my/profile"}
            className="flex cursor-pointer items-center gap-2 p-3 font-bold transition-all hover:translate-x-1 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
          >
            <User size={18} />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link 
            to="/my/profile"
            className="flex cursor-pointer items-center gap-2 p-3 font-bold transition-all hover:translate-x-1 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
          >
            <Settings size={18} />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link 
            to="/my-threads"
            className="flex cursor-pointer items-center gap-2 p-3 font-bold transition-all hover:translate-x-1 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
          >
            <MessageSquare size={18} />
            My Threads
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 h-1 bg-primary" />

        <DropdownMenuItem asChild>
          <a 
            href="https://github.com/p-society/" 
            target="_blank" 
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-2 p-3 font-bold transition-all hover:translate-x-1 hover:bg-foreground hover:text-background"
          >
            <Github size={18} />
            GitHub
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href="https://discord.gg/q74qC2exY4" 
            target="_blank" 
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-2 p-3 font-bold transition-all hover:translate-x-1 hover:bg-foreground hover:text-background"
          >
            <RxDiscordLogo size={18} />
            Discord
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 h-1 bg-primary" />

       <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="group flex cursor-pointer items-center gap-2 p-3 font-bold text-destructive transition-all outline-none 
                       hover:translate-x-1 focus:bg-destructive focus:text-destructive-foreground"
          >
            <LogOut size={18} className="group-focus:text-destructive-foreground" />
            <span className="group-focus:text-destructive-foreground">
              Logout Session
            </span>
          </DropdownMenuItem>
        </AlertDialogTrigger>
        
        <AlertDialogContent className="border-4 border-primary bg-card shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="pixel-font text-2xl text-primary">Log out of IIITBuzz?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-muted-foreground">
              You'll be signed out of your account on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-3 border-border font-bold bg-card shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              Stay logged in
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-destructive text-destructive-foreground border-3 border-black font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
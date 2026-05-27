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
import { ReactNode } from "react";

interface DeleteConfirmationModalProps {
	trigger: ReactNode;
	title: string;
	description: string;
	onConfirm: () => void | Promise<void>;
	isLoading?: boolean;
	confirmText?: string;
	cancelText?: string;
}

export function DeleteConfirmationModal({
	trigger,
	title,
	description,
	onConfirm,
	isLoading = false,
	confirmText = "Delete",
	cancelText = "Cancel",
}: DeleteConfirmationModalProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

			<AlertDialogContent className="border-4 border-primary bg-card shadow-[8px_8px_0px_0px_var(--shadow-color)]">
				<AlertDialogHeader>
					<AlertDialogTitle className="pixel-font text-2xl text-destructive">
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription className="font-bold text-muted-foreground">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-3">
					<AlertDialogCancel className="border-3 border-border font-bold bg-card shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]">
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
                        className="bg-destructive text-destructive-foreground border-3 border-primary font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Deleting..." : confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

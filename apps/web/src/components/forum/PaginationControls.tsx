import { Button } from "@/components/ui/button";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading: boolean;
}

export const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }: Props) => {
    if (totalPages <= 1) return null;

    const renderButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="sm"
                    variant={i === currentPage ? "default" : "neutral"}
                    className="neo-brutal-button font-bold"
                    disabled={loading}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };

    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            <Button
                variant="neutral"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="neo-brutal-button font-bold"
            >
                Prev
            </Button>
            {renderButtons()}
            <Button
                variant="neutral"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="neo-brutal-button font-bold"
            >
                Next
            </Button>
        </div>
    );
};
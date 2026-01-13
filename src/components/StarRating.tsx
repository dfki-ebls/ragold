import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  disabled = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={cn(
            "p-0.5 rounded transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:scale-110",
          )}
          aria-label={`${star} von ${max} Sternen`}
        >
          <Star
            className={cn(
              "w-8 h-8 transition-colors",
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground/30 hover:text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

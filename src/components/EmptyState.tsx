import { FileText } from "lucide-react";

interface EmptyStateProps {
  message: string;
  hint: string;
}

export function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground/60 mt-1">{hint}</p>
    </div>
  );
}

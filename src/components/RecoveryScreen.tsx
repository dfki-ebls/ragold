import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import i18n from "@/i18n";
import { exportPersisted } from "@/lib/archive";
import { resetApp, STORE_KEY } from "@/lib/store";
import { useConfirmAction } from "@/lib/useConfirmAction";

/** Translation with a fallback, since the error may stem from i18n itself. */
function t(key: string, fallback: string): string {
  return i18n.t(key, { defaultValue: fallback });
}

interface RecoveryScreenProps {
  title?: string;
  description?: string;
  /** Technical details of the error, shown verbatim. */
  details?: string;
}

/** Full-page error that offers to export the stored data before resetting the app. */
export function RecoveryScreen({ title, description, details }: RecoveryScreenProps) {
  const { isConfirming, confirm } = useConfirmAction();

  const handleExport = () => {
    // The stored data is exactly what a reset deletes, even if it does not load.
    exportPersisted().then(
      () => toast.success(t("errorBoundary.exportSuccess", "Data exported successfully.")),
      () => toast.error(t("errorBoundary.exportFailed", "Export failed. No data found.")),
    );
  };

  const handleReset = () => {
    confirm("reset", () => {
      resetApp().catch(() => {
        // Best-effort: even if IndexedDB fails, clear localStorage and reload.
        localStorage.removeItem(STORE_KEY);
        window.location.reload();
      });
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title ?? t("errorBoundary.title", "Something went wrong")}</CardTitle>
          <CardDescription>
            {description ??
              t(
                "errorBoundary.description",
                "An unexpected error occurred. You can export your data before resetting the app.",
              )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {details && (
            <pre className="max-h-48 overflow-auto rounded-xl bg-muted p-3 text-xs whitespace-pre-wrap">
              {details}
            </pre>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download />
            {t("errorBoundary.exportButton", "Export Data")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t(
              "errorBoundary.resetDescription",
              "Resetting clears all stored data and reloads the app.",
            )}
          </p>
          <Button variant={isConfirming("reset") ? "destructive" : "outline"} onClick={handleReset}>
            <RotateCcw />
            {isConfirming("reset")
              ? t("errorBoundary.resetConfirm", "Confirm Reset")
              : t("errorBoundary.resetButton", "Reset App")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import dayjs from "dayjs";
import { Download, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { toast } from "sonner";
import i18n from "@/i18n";
import { exportArchive } from "@/lib/archive";
import { resetApp, STORE_KEY } from "@/lib/store";
import { downloadBlob } from "@/lib/utils";

function t(key: string, fallback: string): string {
  return i18n.t(key, { defaultValue: fallback });
}

async function exportData(): Promise<boolean> {
  try {
    await exportArchive();
    return true;
  } catch {
    // Store export failed, fall back to a raw localStorage dump.
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      downloadBlob(
        new Blob([raw], { type: "application/json" }),
        `ragold-recovery-${dayjs().format("YYYYMMDD-HHmmss")}.json`,
      );
      return true;
    } catch {
      return false;
    }
  }
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  confirmReset: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  state: State = {
    hasError: false,
    confirmReset: false,
  };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  componentWillUnmount(): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  handleExport = (): void => {
    void exportData().then((ok) => {
      if (ok) {
        toast.success(t("errorBoundary.exportSuccess", "Data exported successfully."));
      } else {
        toast.error(t("errorBoundary.exportFailed", "Export failed. No data found."));
      }
    });
  };

  handleReset = (): void => {
    if (this.state.confirmReset) {
      resetApp().catch(() => {
        // Best-effort: even if IndexedDB fails, clear localStorage and reload.
        localStorage.removeItem(STORE_KEY);
        window.location.reload();
      });
    } else {
      this.setState({ confirmReset: true });
      this.resetTimer = setTimeout(() => this.setState({ confirmReset: false }), 3000);
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold mb-2">
            {t("errorBoundary.title", "Something went wrong")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              "errorBoundary.description",
              "An unexpected error occurred. You can export your data before resetting the app.",
            )}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Download className="w-4 h-4" />
              {t("errorBoundary.exportButton", "Export Data")}
            </button>
            <p className="text-xs text-muted-foreground">
              {t(
                "errorBoundary.resetDescription",
                "Resetting clears all stored data and reloads the app.",
              )}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                this.state.confirmReset
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "border border-border bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {this.state.confirmReset
                ? t("errorBoundary.resetConfirm", "Confirm Reset")
                : t("errorBoundary.resetButton", "Reset App")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

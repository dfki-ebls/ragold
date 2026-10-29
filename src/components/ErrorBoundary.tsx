import { Component, type ErrorInfo, type ReactNode } from "react";
import { RecoveryScreen } from "@/components/RecoveryScreen";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <RecoveryScreen />;
  }
}

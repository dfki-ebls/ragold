import { useEffect, useRef, useState } from "react";

/**
 * Hook for "click once to arm, click again to confirm" actions.
 *
 * After the first click the action is armed for `timeoutMs` milliseconds.
 * A second click within that window executes the callback; otherwise the
 * action disarms automatically.
 */
export function useConfirmAction(timeoutMs = 3000): {
  isConfirming: (id: string) => boolean;
  confirm: (id: string, onConfirm: () => void) => void;
} {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const isConfirming = (id: string) => confirmingId === id;

  const confirm = (id: string, onConfirm: () => void) => {
    if (confirmingId === id) {
      clearTimeout(timeoutRef.current);
      setConfirmingId(null);
      onConfirm();
    } else {
      clearTimeout(timeoutRef.current);
      setConfirmingId(id);
      timeoutRef.current = setTimeout(() => setConfirmingId(null), timeoutMs);
    }
  };

  return { isConfirming, confirm };
}

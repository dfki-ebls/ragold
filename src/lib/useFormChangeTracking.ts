import { useRef } from "react";

/**
 * Hook that tracks whether form data has changed from an initial snapshot.
 *
 * Comparison uses `JSON.stringify` so it works for plain-data objects.
 * Call `resetTracking` when the form is reset or receives new edit data.
 */
export function useFormChangeTracking<T>(formData: T, initialData: T): {
  hasUnsavedChanges: () => boolean;
  resetTracking: (newInitial: T) => void;
} {
  const initialRef = useRef<T>(initialData);

  return {
    hasUnsavedChanges: () =>
      JSON.stringify(formData) !== JSON.stringify(initialRef.current),
    resetTracking: (newInitial: T) => {
      initialRef.current = newInitial;
    },
  };
}

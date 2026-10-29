import { useEffect, useState } from "react";

type Loaded<K, T> = { key: K; value: T } | { key: K; error: unknown };

/**
 * Load a resource for `key`, ignoring results for keys that are no longer current.
 * A null key loads nothing.
 * Returns undefined while loading and rethrows failures during render for the nearest error boundary.
 * Pass a stable function, it is an effect dependency.
 */
export function useResource<K, T>(key: K | null, load: (key: K) => Promise<T>): T | undefined {
  const [state, setState] = useState<Loaded<K, T>>();

  useEffect(() => {
    if (key === null) {
      return;
    }

    let active = true;

    load(key).then(
      (value) => {
        if (active) setState({ key, value });
      },
      (error: unknown) => {
        if (active) setState({ key, error });
      },
    );

    return () => {
      active = false;
    };
  }, [key, load]);

  if (key === null || state?.key !== key) {
    return undefined;
  }

  if ("error" in state) {
    throw state.error;
  }

  return state.value;
}

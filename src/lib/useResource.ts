import { useEffect, useState } from "react";

type Loaded<K, T> = { key: K; value: T } | { key: K; error: unknown };

/**
 * Load a resource for `key` and dispose it when the key changes or the component unmounts.
 * A null key loads nothing.
 * Returns undefined while loading and rethrows failures during render for the nearest error boundary.
 * Pass stable functions, they are effect dependencies.
 */
export function useResource<K, T>(
  key: K | null,
  load: (key: K) => Promise<T>,
  dispose?: (value: T) => void,
): T | undefined {
  const [state, setState] = useState<Loaded<K, T>>();

  useEffect(() => {
    if (key === null) {
      return;
    }

    let active = true;
    let loaded: { value: T } | undefined;

    load(key).then(
      (value) => {
        if (active) {
          loaded = { value };
          setState({ key, value });
        } else {
          dispose?.(value);
        }
      },
      (error: unknown) => {
        if (active) setState({ key, error });
      },
    );

    return () => {
      active = false;

      if (loaded) {
        dispose?.(loaded.value);
      }
    };
  }, [key, load, dispose]);

  if (key === null || state?.key !== key) {
    return undefined;
  }

  if ("error" in state) {
    throw state.error;
  }

  return state.value;
}
